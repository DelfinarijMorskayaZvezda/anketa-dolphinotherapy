import { createRouter, createWebHistory } from 'vue-router'
import AnketaHealth from '@/components/AnketaHealth.vue'
import ConsentSection from '@/components/ConsentSection.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'anketa-health',
      component: AnketaHealth,
    },
    {
      path: '/consent',
      name: 'consent',
      component: ConsentSection,
    },
  ],
})

export default router
