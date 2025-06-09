import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layout/MainLayout.vue'
import AuthLayout from '@/layout/AuthLayout.vue'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

import AnalyticsView from '@/views/AnalyticsView.vue'
import AnalyticsItemsView from '@/views/AnalyticsItemsView.vue'
import AnalyticsRepairView from '@/views/AnalyticsRepairView.vue'
import AnalyticsReserveView from '@/views/AnalyticsReserveView.vue'

import ItemDetailView from '@/views/ItemDetailView.vue'
import AssetRequestDetailView from '@/views/AssetRequestDetailView.vue'

import UserDetailView from '@/views/UserDetailView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import UsersView from '@/views/UsersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'profile',
          name: 'profile',
          component: UserProfileView,
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: AnalyticsView,
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView,
        },
        {
          path: 'users/:id',
          name: 'user-detail',
          component: UserDetailView,
          props: true,
        },
        {
          path: 'assets/:id',
          name: 'AssetDetail',
          component: ItemDetailView,
          props: true,
        },
        {
          path: 'analytics/items',
          name: 'AnalyticsItems',
          component: AnalyticsItemsView,
        },
        {
          path: 'analytics/repair',
          name: 'analytics-repair',
          component: AnalyticsRepairView,
        },
        {
          path: 'analytics/reserve',
          name: 'analytics-reserve',
          component: AnalyticsReserveView,
        },
        {
          path: 'analytics/free-assets',
          name: 'free-assets',
          component: () => import('@/views/FreeAssetsView.vue'),
        },
        {
          path: '/requests/actual',
          name: 'RequestsActual',
          component: () => import('@/views/RequestsActualView.vue'),
        },
        {
          path: '/requests/history',
          name: 'RequestsHistory',
          component: () => import('@/views/RequestsHistoryView.vue'),
        },
        {
          path: '/asset-requests/:id',
          name: 'AssetRequestDetail',
          component: AssetRequestDetailView,
          props: true,
        },
      ],
    },
    {
      path: '/login',
      component: AuthLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
        },
      ],
    },
  ],
})

// Глобальный навигационный охранник
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('sanctum_token') // Проверяем токен

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Если маршрут требует аутентификации, но пользователь не аутентифицирован
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // Если маршрут доступен только для гостей, но пользователь аутентифицирован
    next({ name: 'home' })
  } else {
    // Разрешаем переход
    next()
  }
})

export default router
