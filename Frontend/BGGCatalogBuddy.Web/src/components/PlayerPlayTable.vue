<template>
    <div v-if="playerPlays && playerPlays.length > 0">
        <div>
            <div class="d-flex align-center justify-center ma-1" v-if="mode == 1">
                <div class="w-100"></div>
                <div style="width: 15%" class="text-h6 text-accent font-weight-bold">
                    Score
                </div>
                <div style="width: 15%" class="text-h6 text-accent font-weight-bold">
                    Position
                </div>
            </div>
        </div>
        <div v-for="playerPlay in orderedPlays" v-bind:key="playerPlay.id">
            <div class="d-flex align-center justify-center ma-1 playerPlayPanel"
                v-on:click.stop="viewPlayer(playerPlay.playerId)" v-if="mode == 1">
                <div class="ma-1">
                    <v-avatar transition="scale-transition" size="60" style="border-style: solid; border-width: 2px"
                        :style="{ borderColor: getBorderColor(playerPlay.player) }">
                        <v-img cover :src="playerPlay.player.imageSource" />
                    </v-avatar>
                </div>
                <div class="w-100 text-h5">
                    <div v-if="playerPlay.winner" class="d-flex align-center justify-center">
                        <div><v-icon color="orange"> mdi-crown </v-icon></div>
                        <div style="padding-top:3px; padding-left: 5px">{{ playerPlay.player.name }}</div>
                    </div>
                    <div v-else class="d-flex align-center justify-center">
                        <div></div>
                        <div>{{ playerPlay.player.name }}</div>
                    </div>
                </div>
                <div style="width: 15%" class="text-h5 font-weight-bold">
                    {{ playerPlay.score.toFixed(2) }}
                </div>
                <div style="width: 15%" class="text-h5 font-weight-bold">
                    {{ calculatePosition(playerPlay) }}
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
//1 = Player plays (Player name, score)
export default {
    name: "PlayerPlayTable",
    props: {
        mode: Number,
        playerPlays: Array,
        orderBy: String,
    },
    methods: {
        viewPlayer(playerId) {
            this.$emitter.emit("playerSelected");
            this.$router.push(`/player/${playerId}`);
        },
        getBorderColor(player) {
            return `#${player.color.slice(2, player.color.length)}`;
        },
        calculatePosition(playerPlay) {
            let position = 0;
            let lastPlayScore = 0;
            let lastPlayerWinner = 0;
            for (const orderedPlay of this.orderedPlays) {
                if (orderedPlay.winner) {
                    position = 1;
                } else if (position === 0 || lastPlayScore !== orderedPlay.score || (lastPlayScore == orderedPlay.score && lastPlayerWinner)) {
                    position++;
                }
                lastPlayerWinner = orderedPlay.winner
                lastPlayScore = orderedPlay.score;
                if (orderedPlay.id == playerPlay.id) {
                    return position;
                }
            }
        }
    },
    computed: {
        orderedPlays() {
            return this.$lodash.orderBy(this.playerPlays, "score", this.orderBy);
        },
    }
};
</script>
<style scoped>
.playerPlayPanel {
    background: rgb(var(--v-theme-surface-darker));
    border-radius: 50px 20px 20px 50px;
    color: rgb(var(--v-theme-surface-darker-text));
}

.playerPlayPanel:hover {
    background: rgb(var(--v-theme-accent-lighter));
    cursor: pointer;
    color: rgb(var(--v-theme-accent-lighter-text)) !important;
}

.playerPlayPanel:hover>.text-h5 {
    font-weight: bold !important;
}
</style>
