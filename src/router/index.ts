import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/views/LoginView.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/views/HomeView.vue')
  },
  {
    path: '/DashboardPopupView',
    name: 'DashboardPopup',
    component: () => import('../components/views/DashboardPopupView.vue')
  },
  {
    path: '/Dashboard2View',
    name: 'Dashboard2Popup',
    component: () => import('../components/views/Dashboard2View.vue')
  },
  {
    path: '/Dashboard3View',
    name: 'Dashboard3Popup',
    component: () => import('../components/views/Dashboard3View.vue')
  },
  {
    path: '/Dashboard4View',
    name: 'Dashboard4Popup',
    component: () => import('../components/views/Dashboard4View.vue')
  },
  {
    path: '/SystemStatusView',
    name: 'SystemStatus',
    component: () => import('../components/views/SystemStatusView.vue')
  },
  {
    path: '/ServerStatusView',
    name: 'ServerStatus',
    component: () => import('../components/views/ServerStatusView.vue')
  },
  {
    path: '/VideoView',
    name: 'VideoView',
    component: () => import('../components/views/VideoView.vue')
  },
  {
    path: '/DeviceManagementView',
    name: 'DeviceManagementView',
    component: () => import('../components/views/DeviceManagementView.vue')
  },
  {
    path: '/ManagementView',
    name: 'ManagementView',
    component: () => import('../components/views/ManagementView.vue')
  },
  {
    path: '/PrometheusSampleView',
    name: 'PrometheusSampleView',
    component: () => import('../components/views/PrometheusSampleView.vue')
  },
  {
    path: '/Settings',
    name: 'Settings',
    component: () => import('../components/views/ManagementView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

/** 로그인하지 않으면 로그인 페이지로만 이동 가능. 쿠키로 /me 호출해 복원. */
// router.beforeEach(async (to, _from, next) => {
//   const authStore = useAuthStore()
//   const isLoginPage = to.name === 'Login'

//   if (!authStore.authReady) {
//     await authStore.fetchUser(api)
//   }

//   if (isLoginPage) {
//     if (authStore.isAuthenticated) {
//       next({ path: '/', replace: true })
//     } else {
//       next()
//     }
//     return
//   }

//   if (!authStore.isAuthenticated) {
//     next({ path: '/login', replace: true })
//     return
//   }
//   next()
// })

export default router

