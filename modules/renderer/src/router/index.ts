import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../view/pages/AppHome.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
  ]
});

export default router;
