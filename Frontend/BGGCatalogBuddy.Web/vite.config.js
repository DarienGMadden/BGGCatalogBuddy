import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueDevTools from "vite-plugin-vue-devtools";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/BGGCatalogBuddy/",
  test: {
    //Needed to avoid having to use import statement in test suite files
    globals: true,
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vuetify(),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
