<template>
  <v-app-bar flat color="transparent">
    <v-container
      style="max-width: none !important"
      class="d-flex justify-center"
    >
      <v-btn to="/" text class="text-h6"
        >Home <v-icon> mdi-home </v-icon></v-btn
      >
    </v-container>
    <v-spacer></v-spacer>
    <v-btn icon @click="toggleTheme">
      <v-icon>{{
        theme.global.name.value === "darkTheme"
          ? "mdi-white-balance-sunny"
          : "mdi-moon-waning-crescent"
      }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { useTheme } from "vuetify";
import { storeToRefs } from "pinia";

import useGlobalStore from "../stores/global";

export default {
  name: "NavBar",
  data: function () {
    return {
      theme: null,
    };
  },

  setup() {
    const theme = useTheme();
    const globalStore = useGlobalStore();
    const { global_selectedTheme } = storeToRefs(globalStore);
    const { global_selectTheme } = globalStore;

    if (global_selectedTheme != null && global_selectedTheme.value) {
      theme.global.name.value = global_selectedTheme.value;
    }

    const toggleTheme = () => {
      const newTheme = !theme.global.current.value.dark
        ? "darkTheme"
        : "lightTheme";
      theme.global.name.value = newTheme;
      global_selectTheme(newTheme);
    };

    return {
      theme,
      toggleTheme,
    };
  },
};
</script>

<style>
.v-app-bar {
  background-color: transparent !important;
  box-shadow: none;
}
</style>
