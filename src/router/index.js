import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import StatsNavigation from '@/components/StatsNavigation.vue'
import Login from '@/components/auth/Login.vue'
import Register from '@/components/auth/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/teams',
      name: 'teams',
      component: StatsNavigation
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    }
  ]
})

export default router 