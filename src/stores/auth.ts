import type { AuthState, LoginRequest, OAuthLoginRequest, RegisterRequest, UserProfile } from '../interfaces/auth';
import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';
import { supabase } from '../config/supabase';
import { authService } from '../services/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null);
  const session = ref<AuthState['session']>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => {
    return !!user.value && !!session.value && session.value.expires_at > Date.now() / 1000;
  });

  const isSessionExpired = computed(() => {
    return session.value ? session.value.expires_at <= Date.now() / 1000 : true;
  });

  async function login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);

      if (response.error) {
        error.value = response.error;
        return { success: false, error: response.error };
      }

      if (response.user && response.session) {
        user.value = response.user;
        session.value = {
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
          expires_at: response.session.expires_at,
        };
        return { success: true };
      }

      return { success: false, error: '登录失败' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function register(credentials: RegisterRequest): Promise<{ success: boolean; error?: string; message?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.register(credentials);

      if (response.error) {
        error.value = response.error;
        return { success: false, error: response.error };
      }

      // 处理需要邮箱验证的情况
      if (response.message) {
        return { success: true, message: response.message };
      }

      if (response.user && response.session) {
        user.value = response.user;
        session.value = {
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
          expires_at: response.session.expires_at,
        };
        return { success: true };
      }

      return { success: false, error: '注册失败' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function loginWithOAuth(request: OAuthLoginRequest): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.loginWithOAuth(request);

      if (response.error) {
        error.value = response.error;
        return { success: false, error: response.error };
      }

      // OAuth 登录成功后不会立即返回用户信息
      // 需要等待认证状态变化回调
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '第三方登录失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.logout();

      if (response.error) {
        error.value = response.error;
      }

      user.value = null;
      session.value = null;

      return { success: !response.error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登出失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function refreshSession(): Promise<{ success: boolean; error?: string }> {
    if (!session.value) return { success: false, error: '无会话信息' };

    loading.value = true;
    error.value = null;

    try {
      const response = await authService.refreshSession();

      if (response.error) {
        error.value = response.error;
        user.value = null;
        session.value = null;
        return { success: false, error: response.error };
      }

      if (response.user && response.session) {
        user.value = response.user;
        session.value = {
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
          expires_at: response.session.expires_at,
        };
        return { success: true };
      }

      return { success: false, error: '刷新会话失败' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刷新会话失败';
      error.value = errorMessage;
      user.value = null;
      session.value = null;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function getCurrentUser(): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const userProfile = await authService.getCurrentUser();

      if (userProfile) {
        user.value = userProfile;
        return { success: true };
      }

      return { success: false, error: '获取用户信息失败' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>): Promise<{ success: boolean; error?: string }> {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.updateProfile(updates);

      if (response.error) {
        error.value = response.error;
        return { success: false, error: response.error };
      }

      if (user.value) {
        user.value = { ...user.value, ...updates };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新资料失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  let authListenerInitialized = false;
  let unsubscribeAuthListener: (() => void) | null = null;

  function initializeAuth() {
    if (authListenerInitialized) {
      return;
    }

    authListenerInitialized = true;

    // 初始化时检查当前会话
    checkCurrentSession();

    // 监听认证状态变化
    unsubscribeAuthListener = authService.onAuthStateChange(
      (event, sessionData, userProfile) => {
        user.value = userProfile;
        session.value = sessionData;

        // 如果是登录成功且当前在登录页面，自动跳转
        if (event === 'SIGNED_IN' && userProfile && sessionData) {
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            setTimeout(() => {
              import('../router').then(({ default: router }) => {
                router.push('/');
              });
            }, 1000);
          }
        }

        // 如果是登出，跳转到登录页
        if (event === 'SIGNED_OUT') {
          if (window.location.pathname !== '/login') {
            setTimeout(() => {
              import('../router').then(({ default: router }) => {
                router.push('/login');
              });
            }, 500);
          }
        }
      }
    );
  }

  async function checkCurrentSession() {
    try {
      // 先检查是否有活跃会话
      const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
      
      if (error || !supabaseSession) {
        user.value = null;
        session.value = null;
        return;
      }

      // 如果有会话，获取用户信息
      const userProfile = await authService.getCurrentUser();
      
      if (userProfile) {
        user.value = userProfile;
        session.value = {
          access_token: supabaseSession.access_token,
          refresh_token: supabaseSession.refresh_token,
          expires_at: supabaseSession.expires_at!,
        };
      }
    } catch (error) {
      console.error('检查当前会话失败:', error);
    }
  }

  function destroyAuth() {
    if (unsubscribeAuthListener) {
      unsubscribeAuthListener();
      unsubscribeAuthListener = null;
    }
    authListenerInitialized = false;
    user.value = null;
    session.value = null;
  }

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isSessionExpired,
    login,
    loginWithOAuth,
    register,
    logout,
    refreshSession,
    getCurrentUser,
    updateProfile,
    clearError,
    initializeAuth,
    checkCurrentSession,
    destroyAuth,
  };
}, {
  persist: {
    key: 'auth-session',
    storage: localStorage,
    paths: ['user', 'session'],
    serializer: {
      serialize: (value) => {
        const data = {
          ...value,
          timestamp: Date.now(),
        };
        return JSON.stringify(data);
      },
      deserialize: (value) => {
        try {
          const data = JSON.parse(value);
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

          // 检查数据是否过期
          if (data.timestamp && (Date.now() - data.timestamp > sevenDaysInMs)) {
            localStorage.removeItem('auth-session');
            return { user: null, session: null };
          }

          // 检查会话是否过期
          if (data.session && data.session.expires_at <= Date.now() / 1000) {
            localStorage.removeItem('auth-session');
            return { user: null, session: null };
          }

          return { user: data.user, session: data.session };
        } catch (error) {
          console.error('反序列化用户会话失败:', error);
          localStorage.removeItem('auth-session');
          return { user: null, session: null };
        }
      },
    },
  },
});