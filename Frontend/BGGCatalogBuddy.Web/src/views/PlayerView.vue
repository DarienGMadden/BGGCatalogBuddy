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
                <LineChart :data="graphData" :options="graphOptions" :style="graphStyle"></LineChart>
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
            <v-row>
              <v-col cols="6">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Favourite Category
                </div>
                <hr class="horizontal-separator" />
                <v-row v-if="categoryRadarGraphData.labels.length > 0">
                  <v-spacer></v-spacer>
                  <v-col cols="12" xxl="9">
                    <RadarChart :data="categoryRadarGraphData" :options="categoryRadarGraphOptions">
                    </RadarChart>
                  </v-col>
                  <v-spacer></v-spacer>
                </v-row>
              </v-col>
              <v-col cols="6">
                <div class="mb-3 pb-1 text-h5 text-accent font-weight-bold">
                  Favourite Mechanic
                </div>
                <hr class="horizontal-separator" />
                <v-row v-if="mechanicRadarGraphData.labels.length > 0">
                  <v-spacer></v-spacer>
                  <v-col cols="12" xxl="9">
                    <RadarChart :data="mechanicRadarGraphData" :options="mechanicRadarGraphOptions">
                    </RadarChart>
                  </v-col>
                  <v-spacer></v-spacer>
                </v-row>
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
import LineChart from "../components/LineChart.vue";
import RadarChart from "../components/RadarChart.vue";
import {
  getPlayerImage,
  getAllFullPlayerDetails,
  getFullPlayerDetails,
} from "@/utils/playerUtils";
import { createGameDataObjectFromPlayerPerspective } from "../utils/gameScoreUtils";
import moment from "moment";


export default {
  name: "Player",
  components: { PlayerTable, PlayerGamesTable, Filters, LineChart, RadarChart },
  data: function () {
    return {
      player: null,
      imageSource: null,
      mostPlayedGames: null,
      mostWonGames: null,
      bestScoringGames: null,
      leaderboardPlayers: null,

      // Player Score Line Chart
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
      },

      // Favourite Category Chart 
      categoryRadarGraphData: null,
      categoryRadarGraphOptions: {
        responsive: true,
        scale: {
          min: 0,
          max: 8,
        }
      },

      // Favourite Mechanic Chart 
      mechanicRadarGraphData: null,
      mechanicRadarGraphOptions: {
        responsive: true,
        scale: {
          min: 0,
          max: 8,
        },
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
      this.generatePlayerScoreChartData();

      this.generateMostPlayedGamesData();
      this.generateMostWonGamesData();
      this.generateBestScoringGamesData();

      this.generateFavouriteCategoryChartData();
      this.generateFavouriteMechanicChartData();
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
          //Currently we are taking the average points of a game and not factoring in total plays of the game.
          //We need to: (playerPoints * gameTotalPlays) / count(gamesTotalPlays)
          score: this.$lodash.sumBy(player.gameData, item => (item.playerPoints * item.gameTotalPlays)) / this.$lodash.sumBy(player.gameData, "gameTotalPlays"),
        })),
        ["score"],
        ["desc"]
      );

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
      ).slice(0, 5);
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

    //Line Chart
    generatePlayerScoreChartData() {
      const numberOfPoints = 10;
      const { start, end } = this.filter_dateRange;
      const filterStartDate = moment(start);
      const filterEndDate = moment(end);
      const iterationDays = filterEndDate.diff(filterStartDate, 'days') / numberOfPoints;

      let arrayOfIterationData = [];

      const playerDetails = getAllFullPlayerDetails(this.data_jsonFile);
      playerDetails.forEach((player) => {
        let startDate = filterStartDate;
        let endDate = moment(filterStartDate).add(iterationDays, "days")

        let playerIterationData = [];

        for (let i = 0; i < numberOfPoints; i++) {
          let gameData = this.generateGameDataForPlayer(
            player,
            startDate,
            endDate,
            this.filter_selectedLocation
          );
          playerIterationData.push({
            playerData: player,
            score: this.$lodash.sumBy(gameData, item => (item.playerPoints * item.gameTotalPlays)) / this.$lodash.sumBy(gameData, "gameTotalPlays") || 0,
            //score: this.$lodash.meanBy(gameData, "playerPoints") || 0,
            startDate: startDate.format("DD/MM"),
            endDate: endDate.format("DD/MM"),
            hasData: gameData.length > 0
          });

          endDate.add(iterationDays, "days");
        }

        if (playerIterationData.some(x => x.hasData)) {
          arrayOfIterationData = arrayOfIterationData.concat(playerIterationData)
        }
      });

      const groupedByEndDateData = this.$lodash.groupBy(arrayOfIterationData, "endDate")
      const labels = Object.entries(groupedByEndDateData).map(([x]) => x);

      const groupedByPlayerData = this.$lodash
        .groupBy(arrayOfIterationData, "playerData.id");

      const datasets = Object.entries(groupedByPlayerData)
        .map(([playerId, playerData]) => ({
          label: playerData[0].playerData.name,
          data: playerData.map((y) => y.score),
          backgroundColor: this.brightenHex(`#${playerData[0].playerData.color.slice(2, playerData[0].playerData.color.length)}`, 30),
          borderColor: `#${playerData[0].playerData.color.slice(2, playerData[0].playerData.color.length)}`,
          pointBorderWidth: 3,
          borderWidth: playerId == this.$route.params.id ? 10 : 4,
          tension: 0.3,
          pointRadius: 7,
          pointHoverRadius: 9,
          borderDash: playerId == this.$route.params.id ? [0] : [4],
          order: playerId == this.$route.params.id ? 0 : 1,
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

    //Radar Charts
    getCategoryStats(gameScores) {
      return this.$lodash(gameScores)
        .flatMap(({ game, playerPoints, playerTotalPlays }) =>
          game.categories.map(category => ({ category, playerPoints, playerTotalPlays }))
        )
        .groupBy('category')
        .map((items, category) => ({
          label: category,
          averageScore: this.$lodash.meanBy(items, 'playerPoints'),
          totalPlays: this.$lodash.sumBy(items, 'playerTotalPlays')
        }))
        .orderBy('totalPlays', 'desc') // Sort descending by total plays
        .value();
    },
    getMechanicStats(gameScores) {
      return this.$lodash(gameScores)
        .flatMap(({ game, playerPoints, playerTotalPlays }) =>
          game.mechanics.map(mechanic => ({ mechanic, playerPoints, playerTotalPlays }))
        )
        .groupBy('mechanic')
        .map((items, mechanic) => ({
          label: mechanic,
          averageScore: this.$lodash.meanBy(items, 'playerPoints'),
          totalPlays: this.$lodash.sumBy(items, 'playerTotalPlays')
        }))
        .orderBy('totalPlays', 'desc') // Sort descending by total plays
        .value();
    },

    // Function to build the radar graph data
    buildRadarGraphData(topData, previousTopData) {
      const graphData = {
        labels: [],
        datasets: [
          {
            label: 'Latest',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            pointBackgroundColor: 'rgba(255,99,132,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255,99,132,1)',
            data: []
          },
          {
            label: 'Historic',
            backgroundColor: 'rgba(179,181,198,0.2)',
            borderColor: 'rgba(179,181,198,1)',
            pointBackgroundColor: 'rgba(179,181,198,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(179,181,198,1)',
            data: []
          }
        ]
      };

      topData.forEach(({ label, averageScore }) => {
        graphData.labels.push(this.truncateString(label, 13));
        graphData.datasets[0].data.push(averageScore);
      });

      // Populate historic data
      previousTopData.forEach(({ label, averageScore }) => {
        const index = graphData.labels.indexOf(this.truncateString(label, 13));
        if (index !== -1) {
          graphData.datasets[1].data[index] = averageScore;
        }
      });

      return graphData;
    },
    generateFavouriteCategoryChartData() {
      const { start, end } = this.filter_dateRange;
      const filterStartDate = moment(new Date(start));
      const filterEndDate = moment(new Date(end));
      const iterationDays = filterEndDate.diff(filterStartDate, 'days');

      // Get the previous date range
      const previousStartDate = moment(filterStartDate).subtract(iterationDays, "days");
      const previousEndDate = moment(filterStartDate);

      // Fetch game data for the current and previous date ranges
      const gameScores = this.generateGameDataForPlayer(
        this.player,
        filterStartDate,
        filterEndDate,
        this.filter_selectedLocation
      );
      const previousGameScores = this.generateGameDataForPlayer(
        this.player,
        previousStartDate,
        previousEndDate,
        this.filter_selectedLocation
      );

      // Get the top categories and build the radar graph data
      const topCategories = this.getCategoryStats(gameScores).slice(0, 10);
      const previousTopCategories = this.getCategoryStats(previousGameScores);
      this.categoryRadarGraphData = this.buildRadarGraphData(topCategories, previousTopCategories);
    },
    generateFavouriteMechanicChartData() {
      const { start, end } = this.filter_dateRange;
      const filterStartDate = moment(new Date(start));
      const filterEndDate = moment(new Date(end));
      const iterationDays = filterEndDate.diff(filterStartDate, 'days');

      // Get the previous date range
      const previousStartDate = moment(filterStartDate).subtract(iterationDays, "days");
      const previousEndDate = moment(filterStartDate);

      // Fetch game data for the current and previous date ranges
      const gameScores = this.generateGameDataForPlayer(
        this.player,
        filterStartDate,
        filterEndDate,
        this.filter_selectedLocation
      );
      const previousGameScores = this.generateGameDataForPlayer(
        this.player,
        previousStartDate,
        previousEndDate,
        this.filter_selectedLocation
      );

      // Get the top mechanic and build the radar graph data
      const topMechanics = this.getMechanicStats(gameScores).slice(0, 10);
      const previousTopMechanics = this.getMechanicStats(previousGameScores);
      this.mechanicRadarGraphData = this.buildRadarGraphData(topMechanics, previousTopMechanics);
    },
    truncateString(str, maxLength) {
      if (str.length > maxLength) {
        return str.slice(0, maxLength) + "...";
      }
      return str;
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
