<template>
  <v-row>
    <v-spacer> </v-spacer>
    <v-col cols="11" sm="11" md="10" lg="9" xl="7" xxl="5">
      <div class="homepage">
        <div>
          <a
            href="https://play.google.com/store/apps/details?id=com.gadestudios.boardgame"
            target="_blank"
          >
            <img
              src="../assets/BGGCatalogLogo.png"
              class="logo"
              alt="BGG Catalog Logo"
            />
          </a>
          <h1 class="text-accent">BGG Catalog Buddy</h1>
        </div>
        <ImportData />
        <v-row class="ma-2" v-if="data_jsonFile != null">
          <v-col cols="6">
            <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
              Players
            </div>
            <hr class="horizontal-separator" />
            <PlayerTable :players="players" :mode="1" />
          </v-col>
          <v-col cols="6">
            <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
              Played Games
            </div>
            <hr class="horizontal-separator" />
            <PlayerGamesTable :games="games" :mode="1" />
          </v-col>
        </v-row>
        <div
          class="ma-2 pb-3 text-h5 font-weight-bold text-surface-darker-text"
          v-else
        >
          No imported data found...
        </div>
      </div>
    </v-col>
    <v-spacer> </v-spacer>
  </v-row>
</template>

<script>
import { mapState } from "pinia";
import useDataStore from "../stores/imported_data";

import ImportData from "../components/ImportData.vue";
import PlayerTable from "../components/PlayerTable.vue";
import PlayerGamesTable from "../components/PlayerGamesTable.vue";

import { getPlayerImage } from "@/utils/playerUtils";

export default {
  name: "Home",
  components: {
    ImportData,
    PlayerTable,
    PlayerGamesTable,
  },
  data: function () {
    return {
      games: [],
      players: [],
    };
  },
  mounted: function () {
    this.$emitter.on("dataImported", this.populatePage);

    this.populatePage();
  },
  unmounted: function () {
    this.$emitter.off("dataImported", this.populatePage);
  },
  methods: {
    populatePage() {
      this.generateGamesData();
      this.generatePlayersData();
    },
    generateGamesData() {
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
        imageSource: x.urlThumb,
        mutedColor: x.mutedColor,
        dominantColor: x.dominantColor,
      }));
    },
    generatePlayersData() {
      if (!this.data_jsonFile) {
        return;
      }
      const filteredPlayers = this.data_jsonFile.players.filter(
        (x) => x.name !== ""
      );
      this.players = filteredPlayers.map((x) => ({
        id: x.id,
        name: x.name,
        color: x.color,
        imageSource: getPlayerImage(this.data_playerImages, x),
      }));
    },
  },
  computed: {
    ...mapState(useDataStore, ["data_jsonFile", "data_playerImages"]),
  },
};
</script>

<style>
.logo {
  height: 8em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.homepage {
  background: rgb(var(--v-theme-surface));
  margin: 0 auto;
  border-radius: 50px;
  border-color: rgb(var(--v-theme-accent-lighter-2));
  border-style: solid;
  border-width: 10px 0px 0px 0px;
}
</style>
