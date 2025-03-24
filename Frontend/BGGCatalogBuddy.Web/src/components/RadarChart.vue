<template>
  <Radar :data="data" :options="options"></Radar>
</template>

<script>
import { Chart as ChartJS, RadialLinearScale, CategoryScale, Title, Tooltip, Legend, PointElement, LineElement, Filler } from "chart.js";
import { Radar } from 'vue-chartjs'
ChartJS.register(RadialLinearScale, CategoryScale, Title, Tooltip, Legend, PointElement, LineElement, Filler);

export default {
  name: "RadarChart",
  components: { Radar },
  props: {
    data: Object,
    options: Object
  }
};
</script>