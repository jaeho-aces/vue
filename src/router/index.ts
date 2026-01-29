import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    component: () => import('../App.vue')
  },
  {
    path: '/dashboard-popup',
    name: 'DashboardPopup',
    component: () => import('../components/views/DashboardPopupView.vue')
  },
  {
    path: '/dashboard2-popup',
    name: 'Dashboard2Popup',
    component: () => import('../components/views/Dashboard2View.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 모든 경로를 /로 리다이렉트 (dashboard-popup, dashboard2-popup 제외)
router.beforeEach((to, from, next) => {
  if (to.path === '/dashboard-popup' || to.path === '/dashboard2-popup') {
    next()
  } else if (to.path !== '/') {
    next('/')
  } else {
    next()
  }
})

export default router

