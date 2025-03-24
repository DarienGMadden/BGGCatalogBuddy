<template>
    <Line :data="data" :options="options" :style="style"></Line>
</template>

<script>
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
  }
};
</script>