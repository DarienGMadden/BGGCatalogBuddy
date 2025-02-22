<template>
  <div v-for="player in players" v-bind:key="player.id">
    <div
      class="d-flex align-center justify-center py-1 ma-1 playerPanel"
      style="color: #bbbbbb"
    >
      <div class="ma-1">
        <v-avatar transition="scale-transition" size="50">
          <v-img cover :src="player.imageSource" />
        </v-avatar>
      </div>
      <div class="w-100 text-h5">
        {{ player.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import useDataStore from "../stores/imported_data";

export default {
  name: "PlayerTable",
  data: function () {
    return {
      players: null,
    };
  },
  mounted: function () {
    this.$emitter.on("dataImported", this.readImportedData);

    this.readImportedData();
  },
  unmounted: function () {
    this.$emitter.off("dataImported", this.readImportedData);
  },
  methods: {
    readImportedData() {
      if (!this.data_jsonFile || !this.data_playerImages) {
        return;
      }

      const filteredPlayers = this.data_jsonFile.players.filter(
        (x) => x.name !== ""
      );
      this.players = filteredPlayers.map((x) => ({
        id: x.id,
        name: x.name,
        imageSource: this.getPlayerImage(x),
      }));
    },

    getPlayerImage(player) {
      const playerImage = this.data_playerImages.filter(
        (x) => x.filename == player.image
      );
      if (playerImage.some) {
        return playerImage[0].base64;
      }
      return "";
    },
  },
  computed: {
    ...mapState(useDataStore, ["data_jsonFile", "data_playerImages"]),
  },
};
</script>
<style scoped>
.playerPanel {
  background: #1f1f1f;
  border-radius: 50px 20px 20px 50px;
}
.playerPanel:hover {
  background: #b28235;
  cursor: pointer;
  font-weight: 500 !important;
  color: black !important;
}
.playerPanel:hover > .text-h5 {
  font-weight: bold !important;
}
</style>
