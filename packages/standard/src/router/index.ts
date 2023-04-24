import { nextTick } from 'vue';
import { createWebHistory, createRouter } from 'vue-router';
import { getNavis } from '../stores/mainStore';
import { systemId, title } from '../utils/env';

export const systemPath = systemId ? `/${systemId}` : '';

const beforeEnter = async (to: any, from: any, next: any) => {
  const navis = await getNavis(to.path, []);
  (to.meta as any).navis = navis;
  next();
};

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: `/`,
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: `${systemPath}/main`,
      name: 'Main',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('../views/Home.vue')
        }
      ]
    },
    /**
     *        기준 정보 관리
     */
    {
      path: `${systemPath}/mdm`,
      name: 'mdm',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'mdm Home',
          component: () => import('../views/Home.vue')
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'StageMaster',
          name: '스테이지',
          meta: { id: 'StageMaster', module: this },
          component: () => import('../views/mdm/MdmStageMaster.vue'),
          beforeEnter
        },
        {
          path: 'SiteMaster',
          name: '사이트',
          meta: { id: 'SiteMaster', module: this },
          component: () => import('../views/mdm/MdmSiteMaster.vue'),
          beforeEnter
        },
        {
          path: 'AllocGroupMaster',
          name: '할당그룹',
          meta: { id: 'AllocGroupMaster', module: this },
          component: () => import('../views/mdm/MdmAllocGroupMaster.vue'),
          beforeEnter
        },
        {
          path: 'FactoryMaster',
          name: '공장운영정보',
          meta: { id: 'FactoryMaster', module: this },
          component: () => import('../views/mdm/MdmFactoryMaster.vue'),
          beforeEnter
        },
        {
          path: 'CodeGroupMaster',
          name: '코드 그룹',
          meta: { id: 'CodeGroupMaster', module: this },
          component: () => import('../views/mdm/MdmCodeGroupMaster.vue'),
          beforeEnter
        },
        {
          path: 'CodeGroupSub1',
          name: '코드 관리',
          meta: { id: 'CodeGroupSub1', module: this },
          component: () => import('../views/mdm/MdmCodeGroupSub1.vue'),
          beforeEnter
        },
        {
          path: 'PropMaster',
          name: '속성 관리',
          meta: { id: 'PropMaster', module: this },
          component: () => import('../views/mdm/MdmPropMaster.vue'),
          beforeEnter
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'ItemMaster',
          name: '품목 정보',
          meta: { id: 'ItemMaster', module: this },
          component: () => import('../views/mdm/MdmItemMaster.vue'),
          beforeEnter
        },
        {
          path: 'BufferMaster',
          name: '버퍼 정보',
          meta: { id: 'BufferMaster', module: this },
          component: () => import('../views/mdm/MdmBufferMaster.vue'),
          beforeEnter
        },
        {
          path: 'IsbMaster',
          name: 'ISB 정보',
          meta: { id: 'IsbMaster', module: this },
          component: () => import('../views/mdm/MdmIsbMaster.vue'),
          beforeEnter
        },
        {
          path: 'BomMaster',
          name: 'BOM MASTER',
          meta: { id: 'BomMaster', module: this },
          component: () => import('../views/mdm/MdmBomMaster.vue'),
          beforeEnter
        },
        {
          path: 'BomSub1',
          name: 'BOM DETAIL',
          meta: { id: 'BomSub1', module: this },
          component: () => import('../views/mdm/MdmBomSub1.vue'),
          beforeEnter
        },
        {
          path: 'BomSub2',
          name: 'BOM DETAIL ALT',
          meta: { id: 'BomSub2', module: this },
          component: () => import('../views/mdm/MdmBomSub2.vue'),
          beforeEnter
        },
        {
          path: 'BomSub3',
          name: 'BOM PROPERTY VALUE',
          meta: { id: 'BomSub3', module: this },
          component: () => import('../views/mdm/MdmBomSub3.vue'),
          beforeEnter
        },
        {
          path: 'BomSub4',
          name: 'BOM ROUTING',
          meta: { id: 'BomRoutingMaster', module: this },
          component: () => import('../views/mdm/MdmBomSub4.vue'),
          beforeEnter
        },
        {
          path: 'BomSub5',
          name: 'BOM ROUTING PROPERTY VALUE',
          meta: { id: 'BomRoutingSub1', module: this },
          component: () => import('../views/mdm/MdmBomSub5.vue'),
          beforeEnter
        },
        {
          path: 'RoutingMaster',
          name: 'ROUTING MASTER',
          meta: { id: 'Routing', module: this },
          component: () => import('../views/mdm/MdmRoutingMaster.vue'),
          beforeEnter
        },
        {
          path: 'RoutingSub1',
          name: 'ROUTING OPERATION',
          meta: { id: 'RoutingSub1', module: this },
          component: () => import('../views/mdm/MdmRoutingSub1.vue'),
          beforeEnter
        },
        {
          path: 'RoutingSub2',
          name: 'ROUTING OPERATION PROPERTY VALUE',
          meta: { id: 'RoutingSub2', module: this },
          component: () => import('../views/mdm/MdmRoutingSub2.vue'),
          beforeEnter
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'Wip',
          name: '재공 정보',
          meta: { id: 'Wip', module: this },
          component: () => import('../views/mdm/MdmWip.vue'),
          beforeEnter
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'CustInfo',
          name: '고객 정보',
          meta: { id: 'CustInfo', module: this },
          component: () => import('../views/mdm/MdmCustInfo.vue'),
          beforeEnter
        },
        {
          path: 'Demand',
          name: 'DEMAND 정보',
          meta: { id: 'Demand', module: this },
          component: () => import('../views/mdm/MdmDemand.vue'),
          beforeEnter
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'ResGroupMaster',
          name: 'RESOURCE GROUP MASTER',
          meta: { id: 'ResGroupMaster', module: this },
          component: () => import('../views/mdm/MdmResGroupMaster.vue'),
          beforeEnter
        },
        {
          path: 'ResMaster',
          name: 'RESOURCE MASTER',
          meta: { id: 'ResMaster', module: this },
          component: () => import('../views/mdm/MdmResMaster.vue'),
          beforeEnter
        },
        {
          path: 'OperResMaster',
          name: 'OPERATION RESOURCE',
          meta: { id: 'OperResMaster', module: this },
          component: () => import('../views/mdm/MdmOperResMaster.vue'),
          beforeEnter
        },
        {
          path: 'OperResSub1',
          name: 'OPERATION RESOURCE PROPERTY VALUE',
          meta: { id: 'OperResSub1', module: this },
          component: () => import('../views/mdm/MdmOperResSub1.vue'),
          beforeEnter
        },
        {
          path: 'ConstInfo',
          name: 'CONSTRAINT INFO',
          meta: { id: 'ConstInfo', module: this },
          component: () => import('../views/mdm/MdmConstInfo.vue'),
          beforeEnter
        },
        {
          path: 'PmPlan',
          name: 'PM PLAN',
          meta: { id: 'PmPlan', module: this },
          component: () => import('../views/mdm/MdmPmPlan.vue'),
          beforeEnter
        },
        {
          path: 'SetupInfo',
          name: 'SETUP INFO',
          meta: { id: 'SetupInfo', module: this },
          component: () => import('../views/mdm/MdmSetupInfo.vue'),
          beforeEnter
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'CalMaster',
          name: '캘린더마스터',
          meta: { id: 'CalMaster', module: this },
          component: () => import('../views/mdm/MdmCalMaster.vue'),
          beforeEnter
        },
        {
          path: 'CalSub1',
          name: '캘린더상세정보',
          meta: { id: 'CalSub1', module: this },
          component: () => import('../views/mdm/MdmCalSub1.vue'),
          beforeEnter
        },
        {
          path: 'CalSub2',
          name: '캘린더속성값 관리',
          meta: { id: 'CalSub2', module: this },
          component: () => import('../views/mdm/MdmCalSub2.vue'),
          beforeEnter
        }
      ]
    },
    /**
     *        계획 관리
     */
    {
      path: `${systemPath}/plm`,
      name: 'plm',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'plm Home',
          component: () => import('../views/Home.vue')
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'RuleSet',
          name: 'RuleSet 관리',
          meta: { id: 'RuleSet', module: this },
          component: () => import('../views/plm/PlmRuleSet.vue'),
          beforeEnter
        },
        {
          path: 'Factor',
          name: 'Factor 관리',
          meta: { id: 'Factor', module: this },
          component: () => import('../views/plm/PlmFactor.vue'),
          beforeEnter
        },
        {
          path: 'Scenario',
          name: '시나리오 관리',
          meta: { id: 'Scenario', module: this },
          component: () => import('../views/plm/PlmScenario.vue'),
          beforeEnter
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'PlanExecute',
          name: '계획실행 및 모니터링',
          meta: { id: 'PlanExecute', module: this },
          component: () => import('../views/plm/PlmPlanExecute.vue'),
          beforeEnter
        }
      ]
    },
    /**
     *        결과분석 및 리포트
     */
    {
      path: `${systemPath}/rar`,
      name: 'aor',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'aor Home',
          component: () => import('../views/Home.vue')
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'PlanDashboard',
          name: 'Plan Dashboard',
          meta: { id: 'PlanDashboard', module: this },
          component: () => import('../views/rar/RarPlanDashboard.vue'),
          beforeEnter
        },
        {
          path: 'RtfReport',
          name: 'RTF현황',
          meta: { id: 'RtfReport', module: this },
          component: () => import('../views/rar/RarRtfReport.vue'),
          beforeEnter
        },
        {
          path: 'ResAllocInfo',
          name: '장비 할당 현황',
          meta: { id: 'ResAllocInfo', module: this },
          component: () => import('../views/rar/RarResAllocInfo.vue'),
          beforeEnter
        },
        {
          path: 'ResGantt',
          name: '장비 간트 차트',
          meta: { id: 'ResGantt', module: this },
          component: () => import('../views/rar/RarResGantt.vue'),
          beforeEnter
        },
        {
          path: 'BomMapView',
          name: 'BOM Map 조회',
          meta: { id: 'BomMapView', module: this },
          component: () => import('../views/rar/RarBomMapView.vue'),
          beforeEnter
        }
      ]
    },
    /**
     *        입력/결과 데이터 조회
     */
    {
      path: `${systemPath}/iod`,
      name: 'out',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'out Home',
          component: () => import('../views/Home.vue')
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'IodReport',
          name: '입력/결과 데이터 조회',
          meta: { id: 'MainReport', module: this },
          component: () => import('../views/iod/IodReport.vue'),
          beforeEnter
        }
      ]
    },
    /**
     *        관리자 메뉴
     */
    {
      path: `${systemPath}/sam`,
      name: 'Manage',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'Manage Home',
          component: () => import('../views/Home.vue')
        },
        /** -------------------------------------------------------------------------------------------- */
        {
          path: 'user',
          name: 'User',
          meta: { id: 'user', module: this },
          component: () => import('../views/sam/SamUserManager.vue'),
          beforeEnter
        },
        {
          path: 'group',
          name: 'Group',
          meta: { id: 'group', module: this },
          component: () => import('../views/sam/SamGroupManager.vue'),
          beforeEnter
        },
        {
          path: 'menu',
          name: 'Menu',
          meta: { id: 'menu', module: this },
          component: () => import('../views/sam/SamMenuManagerNew.vue'),
          beforeEnter
        },
        {
          path: 'log',
          name: 'Log',
          meta: { id: 'log', module: this },
          component: () => import('../views/sam/SamLogViewer.vue'),
          beforeEnter
        }
      ]
    },
    /**
     *        예제
     */
    {
      path: `${systemPath}/exp`,
      name: 'Example',
      component: () => import('../views/Main.vue'),
      children: [
        {
          path: '',
          name: 'Example Home',
          component: () => import('../views/Home.vue')
        },
        {
          path: 'gantt',
          name: 'Gantt',
          meta: { id: 'gantt', module: this },
          component: () => import('../views/exp/Gantt.vue'),
          beforeEnter
        },
        {
          path: 'chart',
          name: 'Chart',
          meta: { id: 'chart', module: this },
          component: () => import('../views/exp/Chart.vue'),
          beforeEnter
        },
        {
          path: 'chart2',
          name: 'Chart2',
          meta: { id: 'chart2', module: this },
          component: () => import('../views/exp/Chart2.vue'),
          beforeEnter
        },
        {
          path: 'gauge',
          name: 'Gauge',
          meta: { id: 'gauge', module: this },
          component: () => import('../views/exp/Gauge.vue'),
          beforeEnter
        },
        {
          path: 'graph',
          name: 'Graph',
          meta: { id: 'graph', module: this },
          component: () => import('../views/exp/Graph.vue'),
          beforeEnter
        }
      ]
    },
    /** -------------------------------------------------------------------------------------------- */
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    },
    {
      path: '/401',
      name: 'Unauthorization',
      props: { isLogOut: true },
      component: () => import('../views/Unauthorization.vue')
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue')
    },
    {
      path: '/500',
      name: 'ServerError',
      component: () => import('../views/NotFound.vue')
    }
  ]
});

router.afterEach((to, from) => {
  const curMenu = to.meta.title ? to.meta.title : to.name?.toString();
  const appTitle = title.replace(/_/gi, ' ');
  nextTick(() => {
    document.title = `${appTitle} - ${curMenu}`;
  });
});

export default router;
