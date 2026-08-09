import JSZip from "jszip";
import imageCompression from "browser-image-compression";

const DEFAULT_ELO = 1500;

export function enrichPlayersPlaysWithElo(jsonFile) {
  if (!jsonFile || !Array.isArray(jsonFile.playersPlays)) {
    return jsonFile;
  }

  const playsById = new Map(
    (jsonFile.plays || []).map((play) => [play.id, play]),
  );

  // Elo is tracked separately for each player at each location.
  const playerLatestElo = new Map();

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

    for (const playerPlay of playEntries) {
      const key = eloKey(locationId, playerPlay.playerId);

      gameStartingElo.set(
        playerPlay.playerId,
        playerLatestElo.get(key) ?? DEFAULT_ELO,
      );
    }

    /*
     * Calculate all players' results using the same
     * pre-game Elo ratings.
     */
    const gameResults = [];

    for (const playerPlay of playEntries) {
      const startingElo =
        gameStartingElo.get(playerPlay.playerId) ?? DEFAULT_ELO;

      const opponents = playEntries.filter(
        (entry) => entry.playerId !== playerPlay.playerId,
      );

      const avgOpponentElo = opponents.length
        ? opponents.reduce(
            (sum, opponent) =>
              sum + (gameStartingElo.get(opponent.playerId) ?? DEFAULT_ELO),
            0,
          ) / opponents.length
        : startingElo;

      const position = getSharedPlacement(playerPlay.playerId);
      const maxPlayers = Math.max(playEntries.length, 1);
      const placementScore = 1 - (position - 1) / Math.max(maxPlayers - 1, 1);
      const winBonus = Number(playerPlay.winner ?? 0) === 1 ? 0.4 : 0;
      const actualResult = Math.max(0, Math.min(1, placementScore + winBonus));
      const expectedResult = 1 / (1 + 10 ** ((avgOpponentElo - startingElo) / 400));
      const kFactor = 24 + 1.25 * gameWeight * 16;
      const eloChange = Math.round((actualResult - expectedResult) * kFactor);
      const endingElo = startingElo + eloChange;

      gameResults.push({
        playerPlay,
        startingElo,
        eloChange,
        endingElo,
      });
    }

    /*
     * Only update the Elo map AFTER every player has
     * been calculated.
     */
    for (const result of gameResults) {
      const { playerPlay, startingElo, eloChange, endingElo } = result;

      playerPlay.startingElo = Number(startingElo.toFixed(2));
      playerPlay.eloChange = Number(eloChange);
      playerPlay.endingElo = Number(endingElo.toFixed(2));

      const key = eloKey(locationId, playerPlay.playerId);
      playerLatestElo.set(key, endingElo);
    }
  }

  return jsonFile;
}

export async function processJsonFile(file) {
  // Wrap the FileReader in a promise
  const jsonData = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        console.log("JSON Data:", data);
        resolve(data); // Resolve the promise with the parsed data
      } catch (error) {
        console.error("Invalid JSON file", error);
        reject(error); // Reject the promise if there's an error
      }
    };

    reader.onerror = (error) => {
      reject(error); // Reject the promise on file read error
    };

    reader.readAsText(file); // Start reading the file
  });

  return jsonData;
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
        console.log("Extracted JSON Data:", jsonData);
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

    console.log("Extracted Images:", this.imagesBase64);
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
