import { nextTick } from "vue";
import { createWebHistory, createRouter } from "vue-router";
import { getNavis } from "../stores/mainStore";
import { systemId, title } from "../utils/env";

const systemPath = import.meta.env.DEV && systemId ? `/${systemId}` : "";

const beforeEnter = (to: any, from: any, next: any) => {
  const navis = getNavis(to.path, []);
  (to.meta as any).navis = navis;
  next();
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: `/`,
      name: "Login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: `${systemPath}`,
      name: "Main",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "Home",
          component: () => import("../views/Home.vue"),
        },
      ],
    },
    {
      path: `${systemPath}/manage`,
      name: "Manage",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "Manage Home",
          component: () => import("../views/Home.vue"),
        },
        {
          path: "user",
          name: "User",
          meta: { id: "user", module: this },
          component: () => import("../views/Manage/UserManager.vue"),
          beforeEnter,
        },
        {
          path: "group",
          name: "Group",
          meta: { id: "group", module: this },
          component: () => import("../views/Manage/GroupManager.vue"),
          beforeEnter,
        },
        {
          path: "menu",
          name: "Menu",
          meta: { id: "menu", module: this },
          component: () => import("../views/Manage/MenuManager.vue"),
          beforeEnter,
        },
        {
          path: "log",
          name: "Log",
          meta: { id: "log", module: this },
          component: () => import("../views/Manage/LogViewer.vue"),
          beforeEnter,
        },
      ],
    },
    {
      path: `${systemPath}/example`,
      name: "Example",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "Example Home",
          component: () => import("../views/Home.vue"),
        },
        {
          path: "todo",
          name: "Todo",
          meta: { id: "todo", module: this },
          component: () => import("../views/Example/Todo.vue"),
          beforeEnter,
        },
        {
          path: "site",
          name: "사이트 관리",
          meta: { id: "site", module: this },
          component: () => import("../views/Example/Site.vue"),
          beforeEnter,
        },
        {
          path: "layout",
          name: "Layout",
          meta: { id: "layout", module: this },
          component: () => import("../views/Example/Layout.vue"),
          beforeEnter,
        },
        {
          path: "layoutOuterController",
          name: "LayoutOuterController",
          meta: { id: "layoutOuterController", module: this },
          component: () => import("../views/Example/LayoutOuterController.vue"),
          beforeEnter,
        },
        {
          path: "gantt",
          name: "Gantt",
          meta: { id: "gantt", module: this },
          component: () => import("../views/Example/Gantt.vue"),
          beforeEnter,
        },
        {
          path: "chart",
          name: "Chart",
          meta: { id: "chart", module: this },
          component: () => import("../views/Example/Chart.vue"),
          beforeEnter,
        },
        {
          path: "chart2",
          name: "Chart2",
          meta: { id: "chart2", module: this },
          component: () => import("../views/Example/Chart2.vue"),
          beforeEnter,
        },
        {
          path: "gauge",
          name: "Gauge",
          meta: { id: "gauge", module: this },
          component: () => import("../views/Example/Gauge.vue"),
          beforeEnter,
        },
        {
          path: "graph",
          name: "Graph",
          meta: { id: "graph", module: this },
          component: () => import("../views/Example/Graph.vue"),
          beforeEnter,
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/404",
    },
    {
      path: "/401",
      name: "Unauthorization",
      props: { isLogOut: true },
      component: () => import("../views/Unauthorization.vue"),
    },
    {
      path: "/404",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
    },
    {
      path: "/500",
      name: "ServerError",
      component: () => import("../views/NotFound.vue"),
    },
  ],
});

router.afterEach((to, from) => {
  const curMenu = to.meta.title ? to.meta.title : to.name?.toString();
  const appTitle = title.replace(/_/gi, " ");
  nextTick(() => {
    document.title = `${appTitle} - ${curMenu}`;
  });
});

export default router;
