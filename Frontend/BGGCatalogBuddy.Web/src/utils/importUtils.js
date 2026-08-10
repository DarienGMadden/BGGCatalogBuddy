import JSZip from "jszip";
import imageCompression from "browser-image-compression";

const DEFAULT_ELO = 1500;
const PROVISIONAL_GAMES = 10;
const PROVISIONAL_K_MULTIPLIER = 1.5;
// Lower-rated players earn and lose more; capped to avoid extreme swings.
const ELO_MODIFIER_MIN = 0.8;
const ELO_MODIFIER_MAX = 1.3;
const ELO_MODIFIER_LOW = 1400;  // ELO at which MAX modifier is reached
const ELO_MODIFIER_HIGH = 1650; // ELO at which MIN modifier is reached
// Higher value makes all matchups look closer to 50/50, compressing future spread.
const ELO_CURVE_DIVISOR = 600;
// 3-player games are the baseline; fewer players = less ELO, more players = more ELO.
const PLAYER_COUNT_BASELINE = 3;
// These players gain less when winning and lose more when losing, regardless of game.
const RESTRICTED_PLAYER_IDS = new Set([3, 4]); // Darien, Steven
const RESTRICTED_GAIN_MULTIPLIER = 0.75;
const RESTRICTED_LOSS_MULTIPLIER = 1.25;

export function enrichPlayersPlaysWithElo(jsonFile) {
  if (!jsonFile || !Array.isArray(jsonFile.playersPlays)) {
    return jsonFile;
  }

  const playsById = new Map(
    (jsonFile.plays || []).map((play) => [play.id, play]),
  );

  // Elo is tracked separately for each player at each location.
  const playerLatestElo = new Map();
  const playerGamesPlayed = new Map();

  const eloKey = (locationId, playerId) => `${locationId}:${playerId}`;

  const playIds = [
    ...new Set(jsonFile.playersPlays.map((entry) => entry.playId)),
  ].sort((a, b) => {
    const playA = playsById.get(a);
    const playB = playsById.get(b);

    const dateA = playA?.playDate ? new Date(playA.playDate).getTime() : 0;
    const dateB = playB?.playDate ? new Date(playB.playDate).getTime() : 0;

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return Number(a) - Number(b);
  });

  for (const playId of playIds) {
    const play = playsById.get(playId);

    const currentGame =
      (jsonFile.games || []).find((game) => game.id === play?.gameId) || {};

    const locationId = play?.locationId;

    const gameWeight =
      Number(
        play?.averageweight ?? currentGame.averageweight ?? play?.weight ?? 2.5,
      ) || 2.5;

    const playEntries = jsonFile.playersPlays.filter(
      (entry) => entry.playId === playId,
    );

    // Solo plays don't affect Elo.
    if (playEntries.length < 2) {
      continue;
    }

    /*
     * calculateWinner determines which direction the score goes.
     *
     * calculateWinner === 1:
     *   Lower score = better
     *
     * Otherwise:
     *   Higher score = better
     */
    const lowerScoreIsBetter = Number(currentGame.calculateWinner ?? 0) === 1;

    const orderedEntries = [...playEntries].sort((a, b) => {
      const aWinner = Number(a.winner ?? 0);
      const bWinner = Number(b.winner ?? 0);

      // Winner always takes priority.
      if (aWinner !== bWinner) {
        return bWinner - aWinner;
      }

      const aScore = Number(a.score ?? Number.NEGATIVE_INFINITY);
      const bScore = Number(b.score ?? Number.NEGATIVE_INFINITY);

      // Some games: lower score is better.
      if (lowerScoreIsBetter) {
        return aScore - bScore;
      }

      // Other games: higher score is better.
      return bScore - aScore;
    });

    const getSharedPlacement = (playerId) => {
      let currentRank = 1;
      let previousWinner = null;
      let previousScore = null;

      for (let index = 0; index < orderedEntries.length; index += 1) {
        const entry = orderedEntries[index];

        const winner = Number(entry.winner ?? 0);
        const score = Number(entry.score ?? Number.NEGATIVE_INFINITY);

        const isSamePlacementAsPrevious =
          previousWinner !== null &&
          previousWinner === winner &&
          previousScore === score;

        if (!isSamePlacementAsPrevious) {
          currentRank = index + 1;
        }

        if (entry.playerId === playerId) {
          return currentRank;
        }

        previousWinner = winner;
        previousScore = score;
      }

      return currentRank;
    };

    /*
     * Take a snapshot of everyone's Elo BEFORE processing
     * this game.
     *
     * This prevents one player's result in the current game
     * from affecting another player's calculation.
     */
    const gameStartingElo = new Map();
    const gameGamesPlayed = new Map();

    for (const playerPlay of playEntries) {
      const key = eloKey(locationId, playerPlay.playerId);

      gameStartingElo.set(
        playerPlay.playerId,
        playerLatestElo.get(key) ?? DEFAULT_ELO,
      );
      gameGamesPlayed.set(
        playerPlay.playerId,
        playerGamesPlayed.get(key) ?? 0,
      );
    }

    /*
     * Calculate all players' results using the same
     * pre-game Elo ratings.
     */
    const placements = new Map(
      playEntries.map((entry) => [entry.playerId, getSharedPlacement(entry.playerId)]),
    );

    // Precompute K-factors so paired K can be used for zero-sum transfers.
    const playerKFactors = new Map();
    for (const playerPlay of playEntries) {
      const startingElo = gameStartingElo.get(playerPlay.playerId) ?? DEFAULT_ELO;
      const gamesPlayed = gameGamesPlayed.get(playerPlay.playerId) ?? 0;
      const baseK = 24 + gameWeight * 6;
      const eloModifier = Math.max(
        ELO_MODIFIER_MIN,
        Math.min(
          ELO_MODIFIER_MAX,
          ELO_MODIFIER_MAX +
            ((ELO_MODIFIER_MIN - ELO_MODIFIER_MAX) * (startingElo - ELO_MODIFIER_LOW)) /
            (ELO_MODIFIER_HIGH - ELO_MODIFIER_LOW),
        ),
      );
      playerKFactors.set(
        playerPlay.playerId,
        baseK * eloModifier * (gamesPlayed < PROVISIONAL_GAMES ? PROVISIONAL_K_MULTIPLIER : 1),
      );
    }

    const gameResults = [];

    for (const playerPlay of playEntries) {
      const startingElo =
        gameStartingElo.get(playerPlay.playerId) ?? DEFAULT_ELO;

      const kFactor = playerKFactors.get(playerPlay.playerId);

      const opponents = playEntries.filter(
        (entry) => entry.playerId !== playerPlay.playerId,
      );

      const playerPosition = placements.get(playerPlay.playerId);

      // Average K per pair ensures each pairwise transfer is zero-sum.
      const pairwiseDelta = opponents.reduce((sum, opponent) => {
        const opponentElo = gameStartingElo.get(opponent.playerId) ?? DEFAULT_ELO;
        const opponentPosition = placements.get(opponent.playerId);
        const pairK = (kFactor + playerKFactors.get(opponent.playerId)) / 2;

        const actual = playerPosition < opponentPosition ? 1.0
                     : playerPosition === opponentPosition ? 0.5
                     : 0.0;
        const expected = 1 / (1 + 10 ** ((opponentElo - startingElo) / ELO_CURVE_DIVISOR));

        return sum + (actual - expected) * pairK;
      }, 0);

      const rawChange = (pairwiseDelta / opponents.length) * (playEntries.length / PLAYER_COUNT_BASELINE);
      const isOwner = RESTRICTED_PLAYER_IDS.has(playerPlay.playerId);
      const adjustedChange = isOwner
        ? rawChange >= 0 ? rawChange * RESTRICTED_GAIN_MULTIPLIER : rawChange * RESTRICTED_LOSS_MULTIPLIER
        : rawChange;

      gameResults.push({
        playerPlay,
        startingElo,
        isOwner,
        rawChange,
        adjustedChange,
      });
    }

    // Redistribute surrendered ELO from owners equally among their opponents.
    for (const result of gameResults) {
      if (!result.isOwner) continue;

      const surrendered = result.rawChange - result.adjustedChange;
      if (surrendered === 0) continue;

      const opponentResults = gameResults.filter(
        (r) => r.playerPlay.playerId !== result.playerPlay.playerId,
      );

      const sharePerOpponent = surrendered / opponentResults.length;
      for (const oppResult of opponentResults) {
        oppResult.adjustedChange += sharePerOpponent;
      }
    }

    // Round and commit final ELO values after redistribution.
    for (const result of gameResults) {
      result.eloChange = Math.round(result.adjustedChange);
      result.endingElo = result.startingElo + result.eloChange;
    }

    /*
     * Only update the Elo map AFTER every player has
     * been calculated.
     */
    for (const result of gameResults) {
      const { playerPlay, startingElo, eloChange, endingElo } = result;

      playerPlay.startingElo = startingElo;
      playerPlay.eloChange = eloChange;
      playerPlay.endingElo = endingElo;

      const key = eloKey(locationId, playerPlay.playerId);
      playerLatestElo.set(key, endingElo);
      playerGamesPlayed.set(key, (playerGamesPlayed.get(key) ?? 0) + 1);
    }
  }

  return jsonFile;
}

export function processJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch (error) {
        console.error("Invalid JSON file", error);
        reject(error);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}
export async function processZipFile(file) {
  let jsonData = null;
  let imagesBase64 = [];
  const zip = new JSZip();
  try {
    const zipContents = await zip.loadAsync(file);

    for (const filename in zipContents.files) {
      const ext = filename.split(".").pop().toLowerCase();

      if (ext === "json") {
        const fileData = await zipContents.files[filename].async("text");
        jsonData = JSON.parse(fileData);
      } else if (["jpg", "jpeg", "png"].includes(ext)) {
        const blob = await zipContents.files[filename].async("blob");
        try {
          const resizedBase64 = await compressAndResizeImage(
            blob,
            filename,
            150,
            150,
            0.85,
          );
          imagesBase64.push({
            base64: resizedBase64,
            filename: filename,
          });
        } catch (error) {
          console.error(`Error processing image ${filename}:`, error);
        }
      }
    }

  } catch (error) {
    console.error("Error processing ZIP file", error);
  }

  return { jsonData, imagesBase64 };
}
async function compressAndResizeImage(
  blob,
  filename,
  maxWidth,
  maxHeight,
  quality = 0.7,
) {
  // Ensure MIME type is set
  const fileType = blob.type || "image/jpeg"; // Default to JPEG if unknown

  // Convert Blob to File
  const file = new File([blob], filename, { type: fileType });

  // Ensure it's an image before compression
  if (!file.type.startsWith("image/")) {
    throw new Error("The file given is not an image");
  }

  const options = {
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    initialQuality: quality,
    useWebWorker: true, // Faster processing
  };

  const compressedBlob = await imageCompression(file, options);
  const base64 = await blobToBase64(compressedBlob);
  return base64;
}
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
