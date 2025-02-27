import _ from "lodash";

//TODO: I need to refactor these methods to properly use the player / game objects passed in.
//The issue we have is the player / game objects have different data depending on from what perspective we have generated them from
//(from the game, or player perspective).
//We need to either create two separate methods to handle it OR, make it so the objects are always the same format. This would
//result in us having two way connections between objects. For example. A playerPlay would have a play object, and then that play object would have a list of playerPlays.
//This might be a bit much though.
export function createGameDataObject(
  dataFile,
  player,
  game,
  gamePlays,
  playerPlayerPlays
) {
  let points = calculatePointsFromPlays(
    dataFile,
    player.id,
    gamePlays,
    game.averageweight,
    game.calculateWinner === 1
  );
  const playIDs = gamePlays.map((y) => y.id);
  const totalWins = playerPlayerPlays.filter(
    (x) =>
      x.playerId == player.id && playIDs.includes(x.playId) && x.winner === 1
  );
  return {
    game: game,
    gameTotalPlays: gamePlays.length,
    player: player,
    playerTotalPlays: playerPlayerPlays.length,
    playerTotalWins: totalWins.length,
    playerPoints: _.meanBy(points, "playerScore"),
    playerPointsV2: _.meanBy(points, "playerScoreV2"),
  };
}

function calculatePointsFromPlays(
  dataFile,
  playerId,
  plays,
  gameWeight,
  lowestScoreWins
) {
  let playerScores = [];
  plays.forEach((play) => {
    const allPlayerPlaysForPlay = dataFile.playersPlays.filter(
      (playerPlay) => playerPlay.playId == play.id
    );
    const orderedPlayerPlays = _.orderBy(
      allPlayerPlaysForPlay,
      ["winner", "score"],
      ["desc", lowestScoreWins ? "asc" : "desc"]
    );

    let position = 0;
    let playerScore = 0;
    let playerScoreV2 = 0;

    let lastPlayScore = 0;
    for (const orderedPlayerPlay of orderedPlayerPlays) {
      if (orderedPlayerPlay.winner) {
        position = 1;
      } else if (position === 0 || lastPlayScore !== orderedPlayerPlay.score) {
        position++;
      }

      lastPlayScore = orderedPlayerPlay.score;
      if (orderedPlayerPlay.playerId == playerId) {
        playerScore = getScoreOffWeightAndPosition(gameWeight, position);
        playerScoreV2 = getScoreOffWeightAndPositionV2(gameWeight, position);
        break;
      }
    }

    playerScores.push({
      playerScore,
      playerScoreV2,
      position,
    });
  });

  return playerScores;
}

function getScoreOffWeightAndPosition(gameWeight, position) {
  if (gameWeight <= 1.8) {
    //Light
    if (position == 1) return 3;
    if (position == 2) return 2;
    if (position == 3) return 1;
    if (position == 4) return 0;
    if (position == 5) return 0;
  } else if (gameWeight <= 2.6) {
    //Medium Light
    if (position == 1) return 5;
    if (position == 2) return 3;
    if (position == 3) return 2;
    if (position == 4) return 1;
    if (position == 5) return 0;
  } else if (gameWeight <= 3.4) {
    //Medium
    if (position == 1) return 6;
    if (position == 2) return 4;
    if (position == 3) return 2;
    if (position == 4) return 1;
    if (position == 5) return 0;
  } else if (gameWeight <= 4.2) {
    //Medium Heavy
    if (position == 1) return 7;
    if (position == 2) return 5;
    if (position == 3) return 3;
    if (position == 4) return 2;
    if (position == 5) return 1;
  } else {
    //Heavy
    if (position == 1) return 9;
    if (position == 2) return 6;
    if (position == 3) return 4;
    if (position == 4) return 2;
    if (position == 5) return 1;
  }
  return 0;
}

function getScoreOffWeightAndPositionV2(gameWeight, position) {
  if (gameWeight <= 1.8) {
    //Light
    if (position == 1) return 4;
    if (position == 2) return 3;
    if (position == 3) return 2;
    if (position == 4) return 1;
    if (position == 5) return 1;
    if (position == 6) return 0;
    if (position == 7) return 0;
  } else if (gameWeight <= 2.6) {
    //Medium Light
    if (position == 1) return 6;
    if (position == 2) return 4;
    if (position == 3) return 3;
    if (position == 4) return 2;
    if (position == 5) return 1;
    if (position == 6) return 1;
    if (position == 7) return 0;
  } else if (gameWeight <= 3.4) {
    //Medium
    if (position == 1) return 7;
    if (position == 2) return 5;
    if (position == 3) return 4;
    if (position == 4) return 3;
    if (position == 5) return 2;
    if (position == 6) return 1;
    if (position == 7) return 0;
  } else if (gameWeight <= 4.2) {
    //Medium Heavy
    if (position == 1) return 9;
    if (position == 2) return 7;
    if (position == 3) return 5;
    if (position == 4) return 4;
    if (position == 5) return 3;
    if (position == 6) return 2;
    if (position == 7) return 1;
  } else {
    //Heavy
    if (position == 1) return 11;
    if (position == 2) return 8;
    if (position == 3) return 6;
    if (position == 4) return 5;
    if (position == 5) return 3;
    if (position == 6) return 2;
    if (position == 7) return 1;
  }
  return 0;
}
