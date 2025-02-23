export function getPlayerDetails(dataFile, playerId) {
  const playerDetails = dataFile.players.filter((x) => x.id == playerId);
  if (playerDetails.some) {
    return playerDetails[0];
  }
}

export function getPlayerImage(dataPlayerImages, player) {
  const playerImage = dataPlayerImages.filter(
    (x) => x.filename == player.image
  );
  if (playerImage.some) {
    return playerImage[0].base64;
  }
  return "";
}
