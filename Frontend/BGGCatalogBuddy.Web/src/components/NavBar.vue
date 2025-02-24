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

export default {
  name: "NavBar",
  data: function () {
    return {
      theme: null,
    };
  },
  setup() {
    const theme = useTheme();
    const toggleTheme = () => {
      theme.global.name.value = !theme.global.current.value.dark
        ? "darkTheme"
        : "lightTheme";
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
