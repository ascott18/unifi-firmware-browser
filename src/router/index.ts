import { createRouter, createWebHashHistory } from "vue-router";
import FirmwareSearch from "../views/FirmwareSearch.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "search",
      component: FirmwareSearch,
    },
    {
      path: "/firmware/:id",
      name: "firmware-details",
      component: () => import("../views/FirmwareDetails.vue"),
    },
    {
      path: "/faq",
      name: "faq",
      component: () => import("../views/FAQ.vue"),
    },
  ],
});

export default router;
