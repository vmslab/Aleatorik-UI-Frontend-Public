import { createWebHistory, createRouter } from "vue-router";
import { Login, NotFound } from "@mozart-ui/vue-main";

// const before

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Login",
      component: Login,
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
          component: () => import("../views/Modeler.vue"),
        },
        {
          path: "gantt",
          name: "Gantt",
          component: () => import("../views/Gantt.vue"),
        },
        {
          path: "chart",
          name: "Chart",
          component: () => import("../views/Chart.vue"),
        },
        {
          path: "chart2",
          name: "Chart2",
          component: () => import("../views/Chart2.vue"),
        },
        {
          path: "gauge",
          name: "Gauge",
          component: () => import("../views/Gauge.vue"),
        },
        {
          path: "graph",
          name: "Graph",
          component: () => import("../views/Graph.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
    {
      path: "/404",
      name: "NotFound",
      component: NotFound,
    },
  ],
});
