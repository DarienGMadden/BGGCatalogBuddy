<template>
  <Radar :data="data" :options="mergedOptions"></Radar>
</template>

<script>
import { Chart as ChartJS, RadialLinearScale, CategoryScale, Title, Tooltip, Legend, PointElement, LineElement, Filler } from "chart.js";
import { Radar } from 'vue-chartjs'
import { useTheme } from 'vuetify';
ChartJS.register(RadialLinearScale, CategoryScale, Title, Tooltip, Legend, PointElement, LineElement, Filler);

export default {
  name: "RadarChart",
  components: { Radar },
  props: {
    data: Object,
    options: Object
  },
  data: function () {
    return {
      theme: useTheme(),
      chartColors: null
    }
  },
  mounted() {
    this.updateChartColors();
  },
  methods: {
    getCssVariable(variable) {
      return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    },
    updateChartColors() {
      this.chartColors = {
        labelColor: `rgb(${this.getCssVariable('--v-theme-surface-darker-text')})`,
        angleLinesColor: `rgb(${this.getCssVariable('--v-theme-surface-light')})`,
        gridColor: `rgb(${this.getCssVariable('--v-theme-surface-light')})`,
        pointLabelColor: `rgb(${this.getCssVariable('--v-theme-surface-darker-text')})`,
        tickColor: `rgb(${this.getCssVariable('--v-theme-surface-darker-text')})`,
      }
    }
  },
  computed: {
    mergedOptions() {
      return this.$lodash.merge({}, this.globalOptions, this.options);
    },
    globalOptions() {
      return {
        plugins: {
          legend: {
            labels: {
              color: this.chartColors.labelColor,
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              color: this.chartColors.angleLinesColor
            },
            grid: {
              color: this.chartColors.gridColor
            },
            pointLabels: {
              color: this.chartColors.pointLabelColor
            },
            ticks: {
              color: this.chartColors.tickColor,
              backdropColor: 'transparent'
            }
          }
        }
      };
    }
  },
  watch: {
    'theme.global.name': {
      immediate: true,
      handler() {
        this.updateChartColors();
      }
    }
  }
};
</script>