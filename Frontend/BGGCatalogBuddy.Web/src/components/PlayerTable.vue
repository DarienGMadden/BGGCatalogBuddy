<template>
  <div v-if="players && players.length > 0">
    <div>
      <div class="d-flex align-center justify-center ma-1" v-if="mode == 3">
        <div class="w-100"></div>
        <div style="width: 15%" class="text-h6 text-accent font-weight-bold">
          Plays
        </div>
        <div style="width: 15%" class="text-h6 text-accent font-weight-bold">
          Wins
        </div>
        <div style="width: 15%" class="text-h6 text-accent font-weight-bold">
          Score
        </div>
      </div>
    </div>
    <div v-for="player in players" v-bind:key="player.id">
      <div
        class="d-flex align-center justify-center ma-1 playerPanel"
        v-on:click.stop="viewPlayer(player.id)"
        v-if="mode == 1"
      >
        <div class="ma-1">
          <v-avatar
            transition="scale-transition"
            size="60"
            style="border-style: solid; border-width: 2px"
            :style="{ borderColor: getBorderColor(player) }"
          >
            <v-img cover :src="player.imageSource" />
          </v-avatar>
        </div>
        <div class="w-100 text-h5">{{ player.name }}</div>
      </div>
      <div
        class="d-flex align-center justify-center ma-1 playerPanel"
        :class="{ playerSelected: player.id == selectPlayer.id }"
        v-on:click.stop="viewPlayer(player.id)"
        v-if="mode == 2"
      >
        <div class="ma-1">
          <v-avatar
            transition="scale-transition"
            size="60"
            style="border-style: solid; border-width: 2px"
            :style="{ borderColor: getBorderColor(player) }"
          >
            <v-img cover :src="player.imageSource" />
          </v-avatar>
        </div>
        <div style="width: 80%" class="text-h5">{{ player.name }}</div>
        <div style="width: 20%" class="text-h5 font-weight-bold">
          {{ player.score.toFixed(2) }}
        </div>
      </div>
      <div
        class="d-flex align-center justify-center ma-1 playerPanel"
        v-on:click.stop="viewPlayer(player.id)"
        v-if="mode == 3"
      >
        <div class="ma-1">
          <v-avatar
            transition="scale-transition"
            size="60"
            style="border-style: solid; border-width: 2px"
            :style="{ borderColor: getBorderColor(player) }"
          >
            <v-img cover :src="player.imageSource" />
          </v-avatar>
        </div>
        <div class="w-100 text-h5">{{ player.name }}</div>
        <div style="width: 15%" class="text-h5 font-weight-bold">
          {{ player.totalPlays }}
        </div>
        <div style="width: 15%" class="text-h5 font-weight-bold">
          {{ player.totalWins }}
        </div>
        <div style="width: 15%" class="text-h5 font-weight-bold">
          {{ player.score.toFixed(2) }}
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
//1 = Home page (just player name)
//2 = Player Leaderboard (player name + score)
//3 = Top Plays for a game (player name + score + total plays + total wins)
export default {
  name: "PlayerTable",
  props: {
    mode: Number,
    players: Array,
    selectPlayer: Object,
  },
  methods: {
    viewPlayer(playerId) {
      this.$emitter.emit("playerSelected");
      this.$router.push(`/player/${playerId}`);
    },
    getBorderColor(player) {
      return `#${player.color.slice(2, player.color.length)}`;
    },
  },
};
</script>
<style scoped>
.playerPanel {
  background: rgb(var(--v-theme-surface-darker));
  border-radius: 50px 20px 20px 50px;
  color: rgb(var(--v-theme-surface-darker-text));
}
.playerPanel:hover {
  background: rgb(var(--v-theme-accent-lighter));
  cursor: pointer;
  color: rgb(var(--v-theme-accent-lighter-text)) !important;
}
.playerPanel:hover > .text-h5 {
  font-weight: bold !important;
}
.playerSelected {
  background: rgb(var(--v-theme-accent-darker));
  color: rgb(var(--v-theme-accent-lighter-text)) !important;
}
</style>
