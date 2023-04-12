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
    /**
     *        기준 정보 관리
     */
    {
      path: `${systemPath}/mdm`,
      name: "mdm",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "mdm Home",
          component: () => import("../views/Home.vue"),
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "Stage",
          name: "스테이지",
          meta: { id: "Stage", module: this },
          component: () => import("../views/mdm/MdmStage.vue"),
          beforeEnter,
        },
        {
          path: "Site",
          name: "사이트",
          meta: { id: "Site", module: this },
          component: () => import("../views/mdm/MdmSite.vue"),
          beforeEnter,
        },
        {
          path: "AllocGroup",
          name: "할당그룹",
          meta: { id: "AllocGroup", module: this },
          component: () => import("../views/mdm/MdmAllocGroup.vue"),
          beforeEnter,
        },
        {
          path: "FactoryOper",
          name: "공장운영정보",
          meta: { id: "FactoryOper", module: this },
          component: () => import("../views/mdm/MdmFactoryOper.vue"),
          beforeEnter,
        },
        {
          path: "CodeGroup",
          name: "코드 그룹",
          meta: { id: "CodeGroup", module: this },
          component: () => import("../views/mdm/MdmCodeGroup.vue"),
          beforeEnter,
        },
        {
          path: "CodeGroupSub1",
          name: "코드 관리",
          meta: { id: "CodeGroupSub1", module: this },
          component: () => import("../views/mdm/MdmCodeGroupSub1.vue"),
          beforeEnter,
        },
        {
          path: "Property",
          name: "속성 관리",
          meta: { id: "Property", module: this },
          component: () => import("../views/mdm/MdmProperty.vue"),
          beforeEnter,
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "Item",
          name: "품목 정보",
          meta: { id: "Item", module: this },
          component: () => import("../views/mdm/MdmItem.vue"),
          beforeEnter,
        },
        {
          path: "Buffer",
          name: "버퍼 정보",
          meta: { id: "Buffer", module: this },
          component: () => import("../views/mdm/MdmBuffer.vue"),
          beforeEnter,
        },
        {
          path: "Isb",
          name: "ISB 정보",
          meta: { id: "Isb", module: this },
          component: () => import("../views/mdm/MdmIsb.vue"),
          beforeEnter,
        },
        {
          path: "Bom",
          name: "BOM MASTER",
          meta: { id: "Bom", module: this },
          component: () => import("../views/mdm/MdmBom.vue"),
          beforeEnter,
        },
        {
          path: "BomSub1",
          name: "BOM DETAIL",
          meta: { id: "BomSub1", module: this },
          component: () => import("../views/mdm/MdmBomSub1.vue"),
          beforeEnter,
        },
        {
          path: "BomSub2",
          name: "BOM DETAIL ALT",
          meta: { id: "BomSub2", module: this },
          component: () => import("../views/mdm/MdmBomSub2.vue"),
          beforeEnter,
        },
        {
          path: "BomSub3",
          name: "BOM PROPERTY VALUE",
          meta: { id: "BomSub3", module: this },
          component: () => import("../views/mdm/MdmBomSub3.vue"),
          beforeEnter,
        },
        {
          path: "Routing",
          name: "ROUTING MASTER",
          meta: { id: "Routing", module: this },
          component: () => import("../views/mdm/MdmRouting.vue"),
          beforeEnter,
        },
        {
          path: "RoutingOper",
          name: "ROUTING OPERATION",
          meta: { id: "RoutingOper", module: this },
          component: () => import("../views/mdm/MdmRoutingOper.vue"),
          beforeEnter,
        },
        {
          path: "RoutingOperSub1",
          name: "ROUTING OPERATION PROPERTY VALUE",
          meta: { id: "RoutingOperSub1", module: this },
          component: () => import("../views/mdm/MdmRoutingOperSub1.vue"),
          beforeEnter,
        },
        {
          path: "BomRouting",
          name: "BOM ROUTING",
          meta: { id: "BomRouting", module: this },
          component: () => import("../views/mdm/MdmBomRouting.vue"),
          beforeEnter,
        },
        {
          path: "BomRoutingSub1",
          name: "BOM ROUTING PROPERTY VALUE",
          meta: { id: "BomRoutingSub1", module: this },
          component: () => import("../views/mdm/MdmBomRoutingSub1.vue"),
          beforeEnter,
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "Wip",
          name: "재공 정보",
          meta: { id: "Wip", module: this },
          component: () => import("../views/mdm/MdmWip.vue"),
          beforeEnter,
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "Demand",
          name: "DEMAND 정보",
          meta: { id: "Demand", module: this },
          component: () => import("../views/mdm/MdmDemand.vue"),
          beforeEnter,
        },
        {
          path: "CustInfo",
          name: "고객 정보",
          meta: { id: "CustInfo", module: this },
          component: () => import("../views/mdm/MdmCustInfo.vue"),
          beforeEnter,
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "Resource",
          name: "RESOURCE MASTER",
          meta: { id: "Resource", module: this },
          component: () => import("../views/mdm/MdmResource.vue"),
          beforeEnter,
        },
        {
          path: "OperResource",
          name: "OPERATION RESOURCE",
          meta: { id: "OperResource", module: this },
          component: () => import("../views/mdm/MdmOperResource.vue"),
          beforeEnter,
        },
        {
          path: "OperResourceSub1",
          name: "OPERATION RESOURCE PROPERTY VALUE",
          meta: { id: "OperResourceSub1", module: this },
          component: () => import("../views/mdm/MdmOperResourceSub1.vue"),
          beforeEnter,
        },
        {
          path: "ConstInfo",
          name: "CONSTRAINT INFO",
          meta: { id: "ConstInfo", module: this },
          component: () => import("../views/mdm/MdmConstInfo.vue"),
          beforeEnter,
        },
        {
          path: "PmPlan",
          name: "PM PLAN",
          meta: { id: "PmPlan", module: this },
          component: () => import("../views/mdm/MdmPmPlan.vue"),
          beforeEnter,
        },
        {
          path: "SetupInfo",
          name: "SETUP INFO",
          meta: { id: "SetupInfo", module: this },
          component: () => import("../views/mdm/MdmSetupInfo.vue"),
          beforeEnter,
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "Calendar",
          name: "캘린더마스터",
          meta: { id: "Calendar", module: this },
          component: () => import("../views/mdm/MdmCalendar.vue"),
          beforeEnter,
        },
        {
          path: "CalendarSub1",
          name: "캘린더상세정보",
          meta: { id: "CalendarSub1", module: this },
          component: () => import("../views/mdm/MdmCalendarSub1.vue"),
          beforeEnter,
        },
        {
          path: "CalendarSub2",
          name: "캘린더속성값 관리",
          meta: { id: "CalendarSub2", module: this },
          component: () => import("../views/mdm/MdmCalendarSub2.vue"),
          beforeEnter,
        },
      ],
    },
    /**
     *        계획 관리
     */
    {
      path: `${systemPath}/plm`,
      name: "plm",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "plm Home",
          component: () => import("../views/Home.vue"),
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "RuleSet",
          name: "RuleSet 관리",
          meta: { id: "RuleSet", module: this },
          component: () => import("../views/plm/PlmRuleSet.vue"),
          beforeEnter,
        },
        {
          path: "Factor",
          name: "Factor 관리",
          meta: { id: "Factor", module: this },
          component: () => import("../views/plm/PlmFactor.vue"),
          beforeEnter,
        },
        {
          path: "Scenario",
          name: "시나리오 관리",
          meta: { id: "Scenario", module: this },
          component: () => import("../views/plm/PlmScenario.vue"),
          beforeEnter,
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "PlanExecute",
          name: "계획실행 및 모니터링",
          meta: { id: "PlanExecute", module: this },
          component: () => import("../views/plm/PlmPlanExecute.vue"),
          beforeEnter,
        },
      ],
    },
    /**
     *        결과분석 및 리포트
     */
    {
      path: `${systemPath}/aor`,
      name: "aor",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "aor Home",
          component: () => import("../views/Home.vue"),
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "PlanDashboard",
          name: "Plan Dashboard",
          meta: { id: "PlanDashboard", module: this },
          component: () => import("../views/aor/AorPlanDashboard.vue"),
          beforeEnter,
        },
        {
          path: "RtfReport",
          name: "RTF현황",
          meta: { id: "RtfReport", module: this },
          component: () => import("../views/aor/AorRtfReport.vue"),
          beforeEnter,
        },
        {
          path: "ResAllocInfo",
          name: "장비 할당 현황",
          meta: { id: "ResAllocInfo", module: this },
          component: () => import("../views/aor/AorResAllocInfo.vue"),
          beforeEnter,
        },
        {
          path: "ResGantt",
          name: "장비 간트 차트",
          meta: { id: "ResGantt", module: this },
          component: () => import("../views/aor/AorResGantt.vue"),
          beforeEnter,
        },
        {
          path: "BomMapView",
          name: "BOM Map 조회",
          meta: { id: "BomMapView", module: this },
          component: () => import("../views/aor/AorBomMapView.vue"),
          beforeEnter,
        },
      ],
    },
    /**
     *        입력/결과 데이터 조회
     */
    {
      path: `${systemPath}/out`,
      name: "out",
      component: () => import("../views/Main.vue"),
      children: [
        {
          path: "",
          name: "out Home",
          component: () => import("../views/Home.vue"),
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: "MainReport",
          name: "입력/결과 데이터 조회",
          meta: { id: "MainReport", module: this },
          component: () => import("../views/out/OutMainReport.vue"),
          beforeEnter,
        },
      ],
    },
    /**
     *        관리자 메뉴
     */
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
        /** -------------------------------------------------------------------------------------------- */
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
    /**
     *        예제
     */
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
    /** -------------------------------------------------------------------------------------------- */
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
