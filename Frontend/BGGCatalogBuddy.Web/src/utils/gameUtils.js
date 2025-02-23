export function getGameDetails(dataFile, gameId) {
  const gameDetails = dataFile.games.filter((x) => x.id == gameId);
  if (gameDetails.some) {
    return gameDetails[0];
  }
}
