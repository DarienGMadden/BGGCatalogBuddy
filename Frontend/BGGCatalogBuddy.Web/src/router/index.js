import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import PlayerView from "../views/PlayerView.vue";
import GameView from "../views/GameView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/player/:id",
      name: "player",
      component: PlayerView,
    },
    {
      path: "/game/:id",
      name: "game",
      component: GameView,
    },
  ],
});
export default router;
