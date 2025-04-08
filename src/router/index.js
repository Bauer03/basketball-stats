import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import Login from '@/components/auth/Login.vue'
import Register from '@/components/auth/Register.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          next({ name: 'teams' })
        } else {
          next()
        }
      }
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('@/views/TeamsView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/views/GamesView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/players',
      name: 'players',
      component: () => import('@/views/PlayersView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/players/:id',
      name: 'player-details',
      component: () => import('@/views/PlayerDetailsView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          next({ name: 'teams' })
        } else {
          next()
        }
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          next({ name: 'teams' })
        } else {
          next()
        }
      }
    }
  ]
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if the route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router 