<template>
  <div v-if="games && games.length > 0">
    <div v-for="game in games" v-bind:key="game.id">
      <div v-on:click.stop="viewGame(game.id)">
        <div
          class="d-flex align-center justify-center ma-1 playerGamePanel"
          v-if="mode == 1"
        >
          <div class="ma-1">
            <v-avatar
              transition="scale-transition"
              size="60"
              style="border-style: solid; border-width: 2px"
              :style="{ borderColor: getBorderColor(game) }"
            >
              <v-img cover :src="game.imageSource" />
            </v-avatar>
          </div>
          <div class="w-100 text-h6">
            {{ game.name }}
          </div>
        </div>
        <div
          class="d-flex align-center justify-center ma-1 playerGamePanel"
          :class="{
            playerGameSelected: selectGame && game.id == selectGame.id,
          }"
          v-else-if="mode == 2"
        >
          <div class="ma-1">
            <v-avatar
              transition="scale-transition"
              size="60"
              style="border-style: solid; border-width: 2px"
              :style="{ borderColor: getBorderColor(game) }"
            >
              <v-img cover :src="game.imageSource" />
            </v-avatar>
          </div>
          <div class="w-100 text-h6">
            {{ game.name }}
          </div>
          <div class="text-h5 font-weight-bold mr-5">
            {{ game.totalPlays }}
          </div>
        </div>
        <div
          class="d-flex align-center justify-center ma-1 playerGamePanel"
          v-else-if="mode == 3"
        >
          <div class="ma-1">
            <v-avatar
              transition="scale-transition"
              size="60"
              style="border-style: solid; border-width: 2px"
              :style="{ borderColor: getBorderColor(game) }"
            >
              <v-img cover :src="game.imageSource" />
            </v-avatar>
          </div>
          <div class="w-100 text-h6">
            {{ game.name }}
          </div>
          <div class="text-h5 font-weight-bold mr-5">
            {{ game.totalWins }}
          </div>
        </div>
        <div
          class="d-flex align-center justify-center ma-1 playerGamePanel"
          v-else-if="mode == 4"
        >
          <div class="ma-1">
            <v-avatar
              transition="scale-transition"
              size="60"
              style="border-style: solid; border-width: 2px"
              :style="{ borderColor: getBorderColor(game) }"
            >
              <v-img cover :src="game.imageSource" />
            </v-avatar>
          </div>
          <div style="width: 90%" class="text-h6">
            {{ game.name }}
          </div>
          <div style="width: 10%" class="text-h5 font-weight-bold">
            {{ game.points.toFixed(2) }}
          </div>
          <!-- <div style="width: 10%" class="text-h5 font-weight-bold">
            {{ game.pointsV2.toFixed(2) }}
          </div> -->
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="text-h6 text-surface-darker-text">No data found...</div>
  </div>
</template>

<script>
//Modes:
//1 = Home page (just game name)
//2 = Most Played Games (game name + total plays)
//3 = Most Won Games (game name + total wins)
//4 = Best Scoring Games (game name + avg score + points)
export default {
  name: "PlayerGamesTable",
  props: {
    mode: Number,
    games: Array,
    selectGame: Object,
  },
  methods: {
    viewGame(gameId) {
      this.$router.push(`/game/${gameId}`);
    },
    getBorderColor(game) {
      return `#${game.mutedColor ? game.mutedColor.slice(2, game.mutedColor.length) : game.dominantColor ? game.dominantColor.slice(2, game.dominantColor.length) : "ffffff"}`;
    },
  },
};
</script>
<style scoped>
.playerGamePanel {
  background: rgb(var(--v-theme-surface-darker));
  border-radius: 50px 20px 20px 50px;
  color: rgb(var(--v-theme-surface-darker-text));
}
.playerGamePanel:hover {
  background: rgb(var(--v-theme-accent-lighter));
  cursor: pointer;
  color: rgb(var(--v-theme-accent-lighter-text)) !important;
}
.playerGamePanel:hover > .text-h6 {
  font-weight: bold !important;
}
.playerGameSelected {
  background: rgb(var(--v-theme-accent-darker));
  color: rgb(var(--v-theme-accent-lighter-text)) !important;
}
</style>
