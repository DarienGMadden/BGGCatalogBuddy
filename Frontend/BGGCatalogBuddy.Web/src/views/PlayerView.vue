<template>
  <v-row>
    <v-spacer></v-spacer>
    <v-col cols="11" sm="11" md="11" lg="10" xl="9">
      <div v-if="player != null">
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
                    <v-img cover :src="imageSource" />
                  </v-avatar>
                </div>
                <div class="text-h4 font-weight-bold text-accent">
                  {{ player.name }}
                </div>
              </v-col>

              <v-col cols="12">
                <PlayerTable
                  :players="leaderboardPlayers"
                  :mode="2"
                  :selectPlayer="player"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" lg="8" class="mainPanel">
            <v-row>
              <v-col cols="6">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Most Played Games
                </div>
                <hr class="horizontal-separator" />
                <PlayerGamesTable
                  :games="mostPlayedGames"
                  :mode="2"
                ></PlayerGamesTable>
              </v-col>

              <v-col cols="6">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Most Won Games
                </div>
                <hr class="horizontal-separator" />
                <PlayerGamesTable
                  :games="mostWonGames"
                  :mode="3"
                ></PlayerGamesTable>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Best Scoring Games
                </div>
                <hr class="horizontal-separator" />
                <PlayerGamesTable
                  :games="bestScoringGames"
                  :mode="4"
                ></PlayerGamesTable>
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
import Filters from "../components/Filters.vue";

import { createGameDataObject } from "@/utils/gameScoreUtils";
import { getPlayerDetails, getPlayerImage } from "@/utils/playerUtils";

export default {
  name: "Player",
  components: { PlayerTable, PlayerGamesTable, Filters },
  data: function () {
    return {
      player: null,
      imageSource: null,
      mostPlayedGames: null,
      mostWonGames: null,
      bestScoringGames: null,
      leaderboardPlayers: null,
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
      this.loadPlayerDetails();

      this.generateLeaderboardPlayersData();

      this.generateMostPlayedGamesData();
      this.generateMostWonGamesData();
      this.generateBestScoringGamesData();
    },
    loadPlayerDetails() {
      this.player = getPlayerDetails(this.data_jsonFile, this.$route.params.id);
      this.imageSource = getPlayerImage(this.data_playerImages, this.player);
    },

    generateLeaderboardPlayersData() {
      const playerDetails = this.data_jsonFile.players.filter(
        (x) => x.name !== ""
      );

      const playerGameData = playerDetails
        .map((player) => ({
          playerData: getPlayerDetails(this.data_jsonFile, player.id),
          gameData: this.generateGameDataForPlayer(
            player.id,
            this.filter_dateRange.start,
            this.filter_dateRange.end,
            this.filter_selectedLocation
          ),
        }))
        .filter((playerGameData) => playerGameData.gameData.length > 0);

      this.leaderboardPlayers = this.$lodash.orderBy(
        playerGameData.map((player) => ({
          id: player.playerData.id,
          name: player.playerData.name,
          color: player.playerData.color,
          imageSource: getPlayerImage(
            this.data_playerImages,
            player.playerData
          ),
          score: this.$lodash.meanBy(player.gameData, "playerPoints"),
        })),
        ["score"],
        ["desc"]
      );
    },
    generateMostPlayedGamesData() {
      const gameData = this.generateGameDataForPlayer(
        this.$route.params.id,
        this.filter_dateRange.start,
        this.filter_dateRange.end,
        this.filter_selectedLocation
      );

      this.mostPlayedGames = this.$lodash
        .orderBy(
          gameData.map((x) => ({
            id: x.game.id,
            name: x.game.name,
            imageSource: x.game.urlThumb,
            mutedColor: x.game.mutedColor,
            dominantColor: x.game.dominantColor,
            totalPlays: x.playerTotalPlays,
          })),
          ["totalPlays"],
          ["desc"]
        )
        .slice(0, 5);
    },
    generateMostWonGamesData() {
      const gameData = this.generateGameDataForPlayer(
        this.$route.params.id,
        this.filter_dateRange.start,
        this.filter_dateRange.end,
        this.filter_selectedLocation
      );

      this.mostWonGames = this.$lodash
        .orderBy(
          gameData.map((x) => ({
            id: x.game.id,
            name: x.game.name,
            imageSource: x.game.urlThumb,
            mutedColor: x.game.mutedColor,
            dominantColor: x.game.dominantColor,
            totalWins: x.playerTotalWins,
          })),
          ["totalWins"],
          ["desc"]
        )
        .slice(0, 5);
    },
    generateBestScoringGamesData() {
      const gameScores = this.generateGameDataForPlayer(
        this.$route.params.id,
        this.filter_dateRange.start,
        this.filter_dateRange.end,
        this.filter_selectedLocation
      );

      this.bestScoringGames = this.$lodash.orderBy(
        gameScores.map((x) => ({
          id: x.game.id,
          name: x.game.name,
          imageSource: x.game.urlThumb,
          mutedColor: x.game.mutedColor,
          dominantColor: x.game.dominantColor,
          points: x.playerPoints,
          pointsV2: x.playerPointsV2,
        })),
        ["points"],
        ["desc"]
      );
    },

    generateGameDataForPlayer(playerId, rangeStart, rangeEnd, locationId) {
      const playerPlays = this.data_jsonFile.playersPlays.filter(
        (x) => x.playerId == playerId
      );

      const playerPlayIDs = playerPlays.map((x) => x.playId);

      const filteredPlays = this.data_jsonFile.plays.filter(
        (x) =>
          playerPlayIDs.includes(x.id) &&
          new Date(x.playDate) >= rangeStart &&
          new Date(x.playDate) <= rangeEnd &&
          x.locationId == locationId
      );

      const playsGroupedByGameId = this.$lodash.groupBy(
        filteredPlays,
        "gameId"
      );

      const gameData = Object.entries(playsGroupedByGameId)
        .map(([gameId, plays]) => {
          //Grab only the playerPlays for the current player, for all the current games plays.
          const playerGamePlays = playerPlays.filter((x) =>
            plays.map((y) => y.id).includes(x.playId)
          );
          return createGameDataObject(
            this.data_jsonFile,
            playerId,
            gameId,
            plays,
            playerGamePlays
          );
        })
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
