export function getAllFullGameDetails(dataFile) {
  const games = dataFile.games.filter((x) => x.name !== "");
  if (!games.some) return null;

  return games.map((x) => getFullGameDetails(dataFile, x.id));
}

export function getFullGameDetails(dataFile, gameId) {
  const gameDetails = dataFile.games.find((x) => x.id == gameId);
  if (!gameDetails) return null;

  const gamePlays = dataFile.plays
    .filter((x) => x.gameId == gameId)
    .map((x) => ({
      ...x,
      location: dataFile.locations.find((y) => y.id == x.locationId),
      playerPlays: dataFile.playersPlays
        .filter((y) => y.playId == x.id)
        .map((y) => ({
          ...y,
          player: dataFile.players.find((z) => z.id == y.playerId),
        })),
    }));
  return {
    ...gameDetails,
    gamePlays: gamePlays,
  };
}
