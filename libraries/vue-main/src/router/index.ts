import { createWebHistory, createRouter } from "vue-router";
import { getNavis } from "../stores/mainStore";

const beforeEnter = (to: any, from: any, next: any) => {
  const navis = getNavis(to.meta?.id, []);
  (to.meta as any).navis = navis;
  next();
};

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/user",
      name: "User",
      component: () => import("../views/UserApp.vue"),
      children: [
        {
          path: "",
          name: "Home",
          component: () => import("../views/Home.vue"),
        },
        {
          path: "modeler",
          name: "Modeler",
          meta: { id: "Modeler", module: this },
          component: () => import("../views/Modeler.vue"),
          beforeEnter,
        },
        {
          path: "gantt",
          name: "Gantt",
          meta: { id: "Gantt", module: this },
          component: () => import("../views/Gantt.vue"),
          beforeEnter,
        },
        {
          path: "chart",
          name: "Chart",
          meta: { id: "Chart", module: this },
          component: () => import("../views/Chart.vue"),
          beforeEnter,
        },
        {
          path: "chart2",
          name: "Chart2",
          meta: { id: "Chart2", module: this },
          component: () => import("../views/Chart2.vue"),
          beforeEnter,
        },
        {
          path: "gauge",
          name: "Gauge",
          meta: { id: "Cauge", module: this },
          component: () => import("../views/Gauge.vue"),
          beforeEnter,
        },
        {
          path: "graph",
          name: "Graph",
          meta: { id: "Graph", module: this },
          component: () => import("../views/Graph.vue"),
          beforeEnter,
        },
        {
          path: "newsetting",
          name: "newsetting",
          meta: { id: "newSetting", module: this },
          component: () => import("../views/NewSetting.vue"),
          beforeEnter,
        },
      ],
    },
    {
      path: "/dev",
      name: "Dev",
      component: () => import("../views/DevApp.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
    {
      path: "/404",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
    },
  ],
});
