import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { checkAuthStatus, user } = useAuth()
  
  // 检测OAuth回调
  const isOAuthCallback = to.query.access_token || to.query.code || to.hash.includes('access_token');
  
  // 如果是OAuth回调，给更多时间让认证状态更新
  if (isOAuthCallback) {
    // 等待最多3秒让认证状态更新
    let attempts = 0;
    const maxAttempts = 30; // 30次 * 100ms = 3秒
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const tempAuthResult = await checkAuthStatus();
      
      if (tempAuthResult.success) {
        // 认证成功，重定向到首页
        next('/');
        return;
      }
      
      attempts++;
    }
  }
  
  // 普通路由检查
  const waitTime = isOAuthCallback ? 200 : 100;
  await new Promise(resolve => setTimeout(resolve, waitTime));
  
  const authResult = await checkAuthStatus();
  
  if (to.meta.requiresAuth) {
    if (!authResult.success) {
      next('/login')
      return
    }
  }
  
  if (to.meta.requiresGuest) {
    if (authResult.success) {
      next('/')
      return
    }
  }
  
  next()
})

export default router