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
                  <v-avatar transition="scale-transition" size="200" style="border-style: solid; border-width: 6px">
                    <v-img cover :src="imageSource" />
                  </v-avatar>
                </div>
                <div class="text-h4 font-weight-bold text-accent">
                  {{ player.name }}
                </div>
              </v-col>

              <v-col cols="12">
                <PlayerTable :players="leaderboardPlayers" :mode="2" :selectPlayer="player" />
              </v-col>
              <v-col cols="12">
                <Line :data="graphData" :options="graphOptions" :style="graphStyle"></Line>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" lg="8" class="mainPanel">
            <v-row>
              <v-col cols="12" sm="12" md="6">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Most Played Games
                </div>
                <hr class="horizontal-separator" />
                <PlayerGamesTable :games="mostPlayedGames" :mode="2"></PlayerGamesTable>
              </v-col>

              <v-col cols="12" sm="12" md="6">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Most Won Games
                </div>
                <hr class="horizontal-separator" />
                <PlayerGamesTable :games="mostWonGames" :mode="3"></PlayerGamesTable>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Best Scoring Games
                </div>
                <hr class="horizontal-separator" />
                <PlayerGamesTable :games="bestScoringGames" :mode="4"></PlayerGamesTable>
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
import {
  getPlayerImage,
  getAllFullPlayerDetails,
  getFullPlayerDetails,
} from "@/utils/playerUtils";
import { createGameDataObjectFromPlayerPerspective } from "../utils/gameScoreUtils";
import moment from "moment";
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
} from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler);


export default {
  name: "Player",
  components: { PlayerTable, PlayerGamesTable, Filters, Line },
  data: function () {
    return {
      player: null,
      imageSource: null,
      mostPlayedGames: null,
      mostWonGames: null,
      bestScoringGames: null,
      leaderboardPlayers: null,
      graphData: null,
      graphOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15
            },
            align: 'center'
          }
        }
      },
      graphStyle: {
        height: '300px'
      }
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
      this.player = getFullPlayerDetails(
        this.data_jsonFile,
        this.$route.params.id
      );
      this.imageSource = getPlayerImage(this.data_playerImages, this.player);
    },

    generateLeaderboardPlayersData() {
      const playerDetails = getAllFullPlayerDetails(this.data_jsonFile);
      const playerGameData = playerDetails
        .map((player) => ({
          playerData: player,
          gameData: this.generateGameDataForPlayer(
            player,
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

      let numberOfWeeks = 10;
      let arrayOfWeeklyData = [];

      playerGameData.forEach((player) => {
        let startDate = moment().subtract(numberOfWeeks, "weeks");
        let endDate = moment().subtract(numberOfWeeks - 1, "weeks");

        for (let i = 0; i < numberOfWeeks; i++) {
          let gameData = this.generateGameDataForPlayer(
            player.playerData,
            startDate,
            endDate,
            this.filter_selectedLocation
          );
          arrayOfWeeklyData.push({
            playerData: player.playerData,
            score: this.$lodash.meanBy(gameData, "playerPoints") || 0,
            startDate: startDate.format("DD/MM"),
            endDate: endDate.format("DD/MM"),
            week: i + 1
          });

          endDate.add(1, "weeks");
        }
      });

      const groupedByEndDateData = this.$lodash.groupBy(arrayOfWeeklyData, "endDate")
      const labels = Object.entries(groupedByEndDateData).map(([x]) => x);

      const groupedByPlayerData = this.$lodash
        .groupBy(arrayOfWeeklyData, "playerData.id");

      const datasets = Object.entries(groupedByPlayerData)
        .map(([playerId, playerData]) => ({
          label: playerData[0].playerData.name,
          data: playerData.map((y) => y.score),
          backgroundColor: this.brightenHex(`#${playerData[0].playerData.color.slice(2, playerData[0].playerData.color.length)}`, 10),
          borderColor: `#${playerData[0].playerData.color.slice(2, playerData[0].playerData.color.length)}`,
          pointBorderWidth: 3,
          borderWidth: 4,
          tension: 0.3,
          pointRadius: 7,
          pointHoverRadius: 9
        }));

      this.graphData = {
        labels: labels,
        datasets: datasets
      };
    },
    brightenHex(hex, percent) {
      // Remove # if present
      hex = hex.replace(/^#/, '');

      // Convert shorthand hex (e.g., #abc) to full form (e.g., #aabbcc)
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }

      // Convert hex to RGB
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);

      // Increase brightness based on percent (clamp between 0 and 255)
      r = Math.min(255, Math.max(0, r + (r * percent / 100)));
      g = Math.min(255, Math.max(0, g + (g * percent / 100)));
      b = Math.min(255, Math.max(0, b + (b * percent / 100)));

      // Convert back to hex and return
      return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
    },
    generateMostPlayedGamesData() {
      const gameData = this.generateGameDataForPlayer(
        this.player,
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
        this.player,
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
        this.player,
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

    generateGameDataForPlayer(player, rangeStart, rangeEnd, locationId) {
      const playerPlays = player.playerPlays;
      const filteredPlays = playerPlays
        .flatMap((x) => x.play)
        .filter(
          (x) =>
            new Date(x.playDate) >= rangeStart &&
            new Date(x.playDate) <= rangeEnd &&
            x.locationId == locationId
        );

      const playsGroupedByGameId = this.$lodash.groupBy(
        filteredPlays,
        "gameId"
      );

      const gameData = Object.entries(playsGroupedByGameId)
        .map(([gameId, filteredGamePlays]) => {
          return createGameDataObjectFromPlayerPerspective(
            this.data_jsonFile,
            player,
            filteredGamePlays[0].game,
            filteredGamePlays
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
