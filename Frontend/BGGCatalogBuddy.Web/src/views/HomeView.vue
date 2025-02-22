<template>
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
      <h1 style="color: #c18d38">BGG Catalog Buddy</h1>
    </div>
    <ImportData />
    <br />
    <v-row class="ma-2">
      <v-col cols="6">
        <h2
          class="mb-3 pb-1"
          style="
            border-style: solid;
            border-color: #191919;
            border-width: 0px 0px 2px 0px;
            color: #c18d38;
          "
        >
          Players
        </h2>
        <PlayerTable />
      </v-col>
      <v-col cols="6">
        <h2
          class="mb-3 pb-1"
          style="
            border-style: solid;
            border-color: #191919;
            border-width: 0px 0px 2px 0px;
            color: #c18d38;
          "
        >
          Played Games
        </h2>
        <PlayedGameTable />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ImportData from "../components/ImportData.vue";
import PlayerTable from "../components/PlayerTable.vue";
import PlayedGameTable from "../components/PlayedGamesTable.vue";

export default {
  name: "Home",
  components: {
    ImportData,
    PlayerTable,
    PlayedGameTable,
  },
  data: function () {
    return {};
  },
  methods: {},
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
  min-width: 980px;
  width: 40%;
  background: #232323;
  margin: 0 auto;
  border-radius: 50px;
}
</style>
