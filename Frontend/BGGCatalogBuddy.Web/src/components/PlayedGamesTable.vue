<template>
  <div v-for="game in games" v-bind:key="game.id">
    <div
      class="d-flex align-center justify-center py-1 ma-1 playedGamePanel"
      style="color: #bbbbbb"
    >
      <div class="ma-1">
        <v-avatar transition="scale-transition" size="50">
          <v-img cover :src="game.imageSource" />
        </v-avatar>
      </div>
      <div class="w-100 text-h6">
        {{ game.name }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import useDataStore from "../stores/imported_data";

export default {
  name: "PlayedGameTable",
  data: function () {
    return {
      games: null,
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
      if (!this.data_jsonFile) {
        return;
      }
      const allPlaysGameIDs = this.data_jsonFile.plays.map((x) => x.gameId);
      const filteredGames = this.data_jsonFile.games.filter(
        (x) => x.name !== "" && allPlaysGameIDs.includes(x.id)
      );
      this.games = filteredGames.map((x) => ({
        id: x.id,
        name: x.name,
        imageSource: this.getGameImage(x),
      }));
    },

    getGameImage(game) {
      return game.urlThumb;
    },
  },
  computed: {
    ...mapState(useDataStore, ["data_jsonFile", "data_playerImages"]),
  },
};
</script>
<style scoped>
.playedGamePanel {
  background: #1f1f1f;
  border-radius: 50px 20px 20px 50px;
}
.playedGamePanel:hover {
  background: #b28235;
  cursor: pointer;
  color: black !important;
}
.playedGamePanel:hover > .text-h6 {
  font-weight: bold !important;
}
</style>
