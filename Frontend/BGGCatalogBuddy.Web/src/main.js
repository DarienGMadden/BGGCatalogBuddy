import "@/assets/css/global.css";

import App from "./App.vue";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import vuetify from "@/plugins/vuetify.js";
import router from "./router";
import mitt from "mitt";
import lodash from "lodash";

const app = createApp(App);
const emitter = mitt();
const pinia = createPinia();

app.config.globalProperties.$emitter = emitter;
app.config.globalProperties.$lodash = lodash;

//Allow stores to access emitter
pinia.use(({ store }) => {
  store.$emitter = app.config.globalProperties.$emitter;
  store.$lodash = app.config.globalProperties.$lodash;
});
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(vuetify);
app.mount("#app");
