<template>
  <Line :data="data" :options="mergedOptions" :style="style"></Line>
</template>

<script>
import { useTheme } from 'vuetify';
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
  name: "LineChart",
  components: { Line },
  props: {
    data: Object,
    options: Object,
    style: Object,
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
        xTickColor: `rgb(${this.getCssVariable('--v-theme-surface-darker-text')})`,
        xGridColor: `rgb(${this.getCssVariable('--v-theme-surface-light')})`,
        yTickColor: `rgb(${this.getCssVariable('--v-theme-surface-darker-text')})`,
        yGridColor: `rgb(${this.getCssVariable('--v-theme-surface-light')})`,
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
              color: this.chartColors.labelColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: this.chartColors.xTickColor
            },
            grid: {
              color: this.chartColors.xGridColor,
            },
            border: {
              width: 3,
              color: this.chartColors.xGridColor
            },
          },
          y: {
            ticks: {
              color: this.chartColors.yTickColor
            },
            grid: {
              color: this.chartColors.yGridColor,
            },
            border: {
              width: 3,
              color: this.chartColors.yGridColor
            },
          }
        }
      }
    },
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