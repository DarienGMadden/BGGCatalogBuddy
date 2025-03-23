<template>
  <div v-if="plays && plays.length > 0">
    <div>
      <div class="d-flex align-center justify-center ma-1" v-if="mode == 1">
        <div class="text-h6 text-accent font-weight-bold">Winner</div>
        <div class="w-100 text-h6 text-accent font-weight-bold">Play Date</div>
        <div class="text-h6 text-accent font-weight-bold" style="width: 30%">
          Player #
        </div>
      </div>
    </div>
    <div v-for="play in plays" v-bind:key="play.id">
      <div v-on:click.stop="viewPlay(play.id)">
        <div
          class="d-flex align-center justify-center ma-1 playPanel"
          v-if="mode == 1"
        >
          <div class="ma-1">
            <v-avatar
              transition="scale-transition"
              size="60"
              style="border-style: solid; border-width: 2px"
              :style="{ borderColor: getBorderColor(play.winningPlayer) }"
            >
              <v-img cover :src="play.winningImageSource" />
            </v-avatar>
          </div>
          <div class="w-100 text-h5">
            {{ play.playDate }}
          </div>
          <div class="text-h5 font-weight-bold" style="width: 30%">
            {{ play.playerCount }}
          </div>
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
//1 = Recent Plays on Game Page (play date, winner, player count, location)
export default {
  name: "PlaysTable",
  props: {
    mode: Number,
    plays: Array,
    selectPlay: Object,
  },
  methods: {
    viewPlay(playId) {
      this.$router.push(`/play/${playId}`);
    },
    getBorderColor(winner) {
      if(winner)
        return `#${winner.color.slice(2, winner.color.length)}`;
    },
  },
};
</script>
<style scoped>
.playPanel {
  background: rgb(var(--v-theme-surface-darker));
  border-radius: 50px 20px 20px 50px;
  color: rgb(var(--v-theme-surface-darker-text));
}
.playPanel:hover {
  background: rgb(var(--v-theme-accent-lighter));
  cursor: pointer;
  color: rgb(var(--v-theme-accent-lighter-text)) !important;
}
.playPanel:hover > .text-h6 {
  font-weight: bold !important;
}
.playSelected {
  background: rgb(var(--v-theme-accent-darker));
  color: rgb(var(--v-theme-accent-lighter-text)) !important;
}
</style>
