import { defineStore } from "pinia";

export default defineStore("global", {
  state: () => ({
    global_selectedTheme: null,
  }),
  persist: true,
  actions: {
    global_selectTheme(selectedTheme) {
      this.global_selectedTheme = selectedTheme;
    },
  },
});
