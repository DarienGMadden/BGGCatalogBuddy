import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { fa } from "vuetify/iconsets/fa";
import { aliases, mdi } from "vuetify/lib/iconsets/mdi";

import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure your project is capable of handling css files

const lightTheme = {
  dark: false,
  colors: {
    background: "#ebebeb",
    surface: "#FFFFFF",
    primary: "#1867C0",
    "surface-darker": "#e3e3e3",
    "surface-darker-2": "#d9d7d7",
    "surface-darker-3": "#cccaca",
    "surface-darker-text": "#212121",
    accent: "#8a24e3",
    "accent-lighter": "#982ff5",
    "accent-lighter-2": "#b86ff7",
    "accent-lighter-text": "#f1e6fa",
    "accent-darker": "#581691",
  },
};

const darkTheme = {
  dark: true,
  colors: {
    background: "#121212",
    surface: "#242424",
    primary: "#1867C0",
    "surface-darker": "#1e1e1e",
    "surface-darker-2": "#171717",
    "surface-darker-3": "#0a0a0a",
    "surface-darker-text": "#bbbbbb",
    accent: "#c18d38",
    "accent-lighter": "#b28235",
    "accent-lighter-2": "#c4984f",
    "accent-lighter-text": "#111111",
    "accent-darker": "#705221",
  },
};

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "lightTheme",
    themes: {
      darkTheme,
      lightTheme,
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
      fa,
    },
  },
});
