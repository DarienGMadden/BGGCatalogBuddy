<template>
  <v-row>
    <v-spacer></v-spacer>
    <v-col cols="11" sm="11" md="11" lg="10" xl="9">
      <div v-if="game != null">
        <v-row class="ma-0">
          <v-col cols="12" lg="4" class="sidePanel">
            <v-row>
              <v-col cols="12" class="py-2">
                <div class="mb-2">
                  <v-avatar
                    transition="scale-transition"
                    size="200"
                    style="border-style: solid; border-width: 6px"
                  >
                    <v-img cover :src="game.urlImage" />
                  </v-avatar>
                </div>
                <div class="text-h4 font-weight-bold text-accent">
                  {{ game.name }}
                </div>
              </v-col>

              <v-col cols="12">
                <PlayerGamesTable
                  :games="leaderboardGames"
                  :mode="2"
                  :selectGame="game"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" lg="8" class="mainPanel">
            <v-row>
              <v-col cols="12">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Top Players
                </div>
                <hr class="horizontal-separator" />
                <PlayerTable :players="topPlayersData" :mode="3"></PlayerTable>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Recent Plays
                </div>
                <hr class="horizontal-separator" />
                <PlaysTable :plays="recentPlays" :mode="1"></PlaysTable>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <Filters></Filters>
      </div>
    </v-col>
    <v-spacer></v-spacer>
  </v-row>
</template>
<script>
import { mapState } from "pinia";
import useDataStore from "../stores/imported_data";
import useFilterStore from "../stores/filters";

import PlayerTable from "../components/PlayerTable.vue";
import PlayerGamesTable from "../components/PlayerGamesTable.vue";
import PlaysTable from "../components/PlaysTable.vue";
import Filters from "../components/Filters.vue";

import { createGameDataObject } from "@/utils/gameScoreUtils";
import { getPlayerImage } from "@/utils/playerUtils";
import { getGameDetails } from "@/utils/gameUtils";

import moment from "moment";

export default {
  name: "Game",
  components: { PlayerTable, PlayerGamesTable, PlaysTable, Filters },
  data: function () {
    return {
      game: null,
      topPlayersData: null,
      leaderboardGames: null,
      recentPlays: null,
    };
  },
  mounted: function () {
    this.$emitter.on("filterUpdated", this.populateAllData);
    this.populateAllData();
  },
  unmounted: function () {
    this.$emitter.off("filterUpdated", this.populateAllData);
  },
  watch: {
    "$route.params.id"() {
      this.populateAllData();
    },
  },
  methods: {
    populateAllData() {
      this.loadGameDetails();

      this.generateLeaderboardGamesData();
      this.generateTopPlayersData();
      this.generateRecentPlaysData();
    },
    loadGameDetails() {
      this.game = getGameDetails(this.data_jsonFile, this.$route.params.id);
    },
    generateLeaderboardGamesData() {
      const gameDetails = this.data_jsonFile.games.filter((x) => x.name !== "");
      const gameData = gameDetails
        .map((game) =>
          this.generateGameData(
            game,
            this.filter_dateRange.start,
            this.filter_dateRange.end,
            this.filter_selectedLocation
          )
        )
        .filter((x) => x.length > 0);
      this.leaderboardGames = this.$lodash.orderBy(
        gameData.map((x) => ({
          id: x[0].game.id,
          name: x[0].game.name,
          imageSource: x[0].game.urlThumb,
          mutedColor: x[0].game.mutedColor,
          dominantColor: x[0].game.dominantColor,
          totalPlays: x[0].gameTotalPlays,
        })),
        ["totalPlays"],
        ["desc"]
      );
    },
    generateTopPlayersData() {
      const gameData = this.generateGameData(
        this.game,
        this.filter_dateRange.start,
        this.filter_dateRange.end,
        this.filter_selectedLocation
      );

      this.topPlayersData = this.$lodash.orderBy(
        gameData.map((x) => ({
          id: x.player.id,
          name: x.player.name,
          color: x.player.color,
          imageSource: getPlayerImage(this.data_playerImages, x.player),
          totalPlays: x.playerTotalPlays,
          totalWins: x.playerTotalWins,
          score: x.playerPoints,
        })),
        ["score"],
        ["desc"]
      );
    },
    generateRecentPlaysData() {
      const recentPlays = this.data_jsonFile.plays.filter(
        (x) =>
          x.gameId == this.game.id &&
          new Date(x.playDate) >= this.filter_dateRange.start &&
          new Date(x.playDate) <= this.filter_dateRange.end &&
          x.locationId == this.filter_selectedLocation
      );

      const recentPlaysPlayerPlays = this.data_jsonFile.playersPlays.filter(
        (x) => recentPlays.map((y) => y.id).includes(x.playId)
      );

      const groupedRecentPlaysPlayerPlays = this.$lodash.groupBy(
        recentPlaysPlayerPlays,
        "playId"
      );

      const recentPlayData = [];
      Object.entries(groupedRecentPlaysPlayerPlays).forEach(
        ([playId, playerPlays]) => {
          const playObj = recentPlays.filter((x) => x.id == playId)[0];
          const totalPlayers = playerPlays.length;
          const anyWinners = playerPlays.filter((y) => y.winner);
          const winner =
            anyWinners.length > 0
              ? this.data_jsonFile.players.filter(
                  (x) => x.id == anyWinners[0].playerId
                )[0]
              : null;

          recentPlayData.push({
            id: playId,
            playDate: playObj.playDate,
            playerCount: totalPlayers,
            winningPlayer: winner,
            winningImageSource: getPlayerImage(this.data_playerImages, winner),
          });
        }
      );
      this.recentPlays = this.$lodash
        .orderBy(recentPlayData, ["playDate"], ["desc"])
        .slice(0, 5);
    },
    generateGameData(game, rangeStart, rangeEnd, locationId) {
      const gamePlays = this.data_jsonFile.plays.filter(
        (x) =>
          x.gameId == game.id &&
          new Date(x.playDate) >= rangeStart &&
          new Date(x.playDate) <= rangeEnd &&
          x.locationId == locationId
      );
      const gamePlayIDs = gamePlays.map((x) => x.id);

      const playerPlays = this.data_jsonFile.playersPlays.filter((x) =>
        gamePlayIDs.includes(x.playId)
      );
      const groupedPlayerPlays = this.$lodash.groupBy(playerPlays, "playerId");

      const gameData = Object.entries(groupedPlayerPlays)
        .map(([playerId, playerPlays]) =>
          createGameDataObject(
            this.data_jsonFile,
            playerId,
            game.id,
            gamePlays,
            playerPlays
          )
        )
        .filter((item) => item !== null); // remove any nulls
      return gameData;
    },
  },

  computed: {
    ...mapState(useDataStore, ["data_jsonFile", "data_playerImages"]),
    ...mapState(useFilterStore, [
      "filter_selectedLocation",
      "filter_dateRange",
    ]),
  },
};
</script>

<style>
.sidePanel {
  background: rgb(var(--v-theme-surface-darker-2));
  border-radius: 50px 0px 0px 0px;
  border-color: rgb(var(--v-theme-accent-lighter-2));
  border-style: solid;
  border-width: 10px 0px 0px 0px;
}
.mainPanel {
  background: rgb(var(--v-theme-surface));
  border-radius: 0px 50px 0px 0px;
  border-color: rgb(var(--v-theme-accent-lighter-2));
  border-style: solid;
  border-width: 10px 0px 0px 0px;
}
</style>
