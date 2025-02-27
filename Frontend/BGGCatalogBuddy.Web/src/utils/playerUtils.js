export function getPlayerImage(dataPlayerImages, player) {
  const playerImage = dataPlayerImages.filter(
    (x) => x.filename == player.image
  );
  if (playerImage.some) {
    return playerImage[0].base64;
  }
  return "";
}

export function getAllFullPlayerDetails(dataFile) {
  const players = dataFile.players.filter((x) => x.name !== "");
  if (!players.some) return null;

  return players.map((x) => getFullPlayerDetails(dataFile, x.id));
}

export function getFullPlayerDetails(dataFile, playerId) {
  const playerDetails = dataFile.players.find((x) => x.id == playerId);
  if (!playerDetails) return null;

  const playerPlays = dataFile.playersPlays
    .filter((x) => x.playerId == playerId)
    .map((x) => ({
      ...x,
      play: dataFile.plays
        .filter((y) => y.id == x.playId)
        .map((y) => ({
          ...y,
          location: dataFile.locations.find((z) => z.id == y.locationId),
          game: dataFile.games.find((z) => z.id == y.gameId),
        }))[0],
    }));
  return {
    ...playerDetails,
    playerPlays: playerPlays,
  };
}
