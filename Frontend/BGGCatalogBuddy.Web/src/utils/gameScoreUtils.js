import _ from "lodash";

//Creates an object from a PLAYERS perspective, of a game and how many times the game has been played by this player.
export function createGameDataObjectFromPlayerPerspective(
  dataFile,
  player,
  game,
  filteredGamePlays //Contains just a list of THIS games gamePlays filtered by location and date range
) {
  //All the points + placements the particular player got for all the gamePlays passed in
  let points = filteredGamePlays.map((play) =>
    getPlayerScoreFromPlay(
      dataFile,
      player.id,
      play,
      game.averageweight,
      game.calculateWinner === 1
    )
  );
  const playerPlayerPlays = player.playerPlays.filter(
    (x) =>
      x.playerId == player.id &&
      filteredGamePlays.map((y) => y.id).includes(x.playId)
  );
  const totalWins = playerPlayerPlays.filter((x) => x.winner === 1);
  return {
    game: game,
    gameTotalPlays: filteredGamePlays.length,
    player: player,
    playerTotalPlays: playerPlayerPlays.length,
    playerTotalWins: totalWins.length,
    playerPoints: _.meanBy(points, "playerScore"),
    playerPointsV2: _.meanBy(points, "playerScoreV2"),
  };
}

//Creates an object from a GAMES perspective, of a player and how many times they have played this game.
export function createPlayerDataObjectFromGamePerspective(
  dataFile,
  player,
  game,
  filteredGamePlays //Contains just a list of THIS games gamePlays filtered by location and date range
) {
  //All the points + placements the particular player got for all the gamePlays passed in
  let points = filteredGamePlays.map((play) =>
    getPlayerScoreFromPlay(
      dataFile,
      player.id,
      play,
      game.averageweight,
      game.calculateWinner === 1
    )
  );
  const playerPlayerPlays = filteredGamePlays
    .flatMap((x) => x.playerPlays)
    .filter((x) => x.playerId == player.id);

  const totalWins = playerPlayerPlays.filter((x) => x.winner === 1);
  return {
    game: game,
    gameTotalPlays: filteredGamePlays.length,
    player: player,
    playerTotalPlays: playerPlayerPlays.length,
    playerTotalWins: totalWins.length,
    playerPoints: _.meanBy(points, "playerScore"),
    playerPointsV2: _.meanBy(points, "playerScoreV2"),
  };
}

function getPlayerScoreFromPlay(
  dataFile,
  playerId,
  play,
  gameWeight,
  lowestScoreWins
) {
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

  return {
    playerScore,
    playerScoreV2,
    position,
  };
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
