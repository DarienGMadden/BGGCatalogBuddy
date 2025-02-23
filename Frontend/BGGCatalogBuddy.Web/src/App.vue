<template>
  <v-app class="pa-0" :style="{ backgroundColor: appBackground }">
    <NavBar style="padding: 0px 1%" />
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "./components/NavBar.vue";
export default {
  name: "App",
  data: function () {
    return {};
  },
  components: {
    NavBar,
  },
};
</script>
