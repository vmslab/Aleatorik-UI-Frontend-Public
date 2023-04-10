import Vue from "vue";
import VueRouter, { Route } from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/project",
    name: "Project",
    component: () => import("../views/ProjectMgmt.vue"),
  },
  // {
  //   path: "/auth",
  //   name: "Auth",
  //   component: () => import("../views/AuthTestView.vue"),
  // },
  {
    path: "/server-management",
    name: "Server Management",
    component: () => import("../views/ServerMgmt.vue"),
  },
  {
    path: "/customer-management",
    name: "Customer Management ",
    component: () => import("../views/CustomerMgmt.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
