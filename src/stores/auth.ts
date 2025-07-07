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

  async function login(credentials: LoginRequest) {
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
        session.value = response.session;
        return { success: true };
      }

      return { success: false, error: '登录失败' };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  async function register(credentials: RegisterRequest) {
    loading.value = true;
    error.value = null;

    try {
      const response = await authService.register(credentials);

      if (response.error) {
        error.value = response.error;
        return { success: false, error: response.error };
      }

      if (response.user && response.session) {
        user.value = response.user;
        session.value = response.session;
        return { success: true };
      }

      return { success: false, error: '注册失败' };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  async function loginWithOAuth(request: OAuthLoginRequest) {
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
      console.log('OAuth 登录请求已发送，等待回调...');
      return { success: true };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '第三方登录失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  async function logout() {
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
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登出失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  async function refreshSession() {
    if (!session.value)
      return { success: false, error: '无会话信息' };

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
        session.value = response.session;
        return { success: true };
      }

      return { success: false, error: '刷新会话失败' };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刷新会话失败';
      error.value = errorMessage;
      user.value = null;
      session.value = null;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  async function getCurrentUser() {
    loading.value = true;
    error.value = null;

    try {
      const userProfile = await authService.getCurrentUser();

      if (userProfile) {
        user.value = userProfile;
        return { success: true };
      }

      return { success: false, error: '获取用户信息失败' };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
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
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新资料失败';
      error.value = errorMessage;
      return { success: false, error: errorMessage };
    }
    finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  let authListenerInitialized = false;
  let isCheckingSession = false;

  function initializeAuth() {
    if (authListenerInitialized) {
      return;
    }

    authListenerInitialized = true;
    checkCurrentSession();

    authService.onAuthStateChange(async (userProfile) => {
      user.value = userProfile;

      if (userProfile) {
        try {
          const { data: { session: supabaseSession } } = await supabase.auth.getSession();
          if (supabaseSession) {
            session.value = {
              access_token: supabaseSession.access_token,
              refresh_token: supabaseSession.refresh_token,
              expires_at: supabaseSession.expires_at!,
            };

            if (window.location.pathname === '/login') {
              setTimeout(() => {
                if (isAuthenticated.value || (user.value && session.value)) {
                  // 使用路由跳转而不是直接修改location
                  import('../router').then(({ default: router }) => {
                    router.push('/');
                  });
                }
              }, 1000);
            }
          }
        }
        catch (error) {
          console.error('获取会话信息失败:', error);
        }
      }
      else {
        session.value = null;
      }
    });
  }

  async function checkCurrentSession() {
    if (isCheckingSession) {
      return;
    }

    isCheckingSession = true;

    try {
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();

      if (supabaseSession?.user) {
        let userProfile = await authService.getCurrentUser();

        // 如果查询失败或没有记录，触发器应该已经创建了记录
        // 但如果仍然没有，我们创建一个临时的用户资料
        if (!userProfile) {
          userProfile = {
            id: supabaseSession.user.id, // 这里使用auth_user_id  
            email: supabaseSession.user.email || '',
            name: supabaseSession.user.user_metadata?.name || supabaseSession.user.user_metadata?.full_name || '',
            avatar: supabaseSession.user.user_metadata?.avatar_url || '',
            created_at: supabaseSession.user.created_at,
            updated_at: new Date().toISOString(),
            auth_user_id: supabaseSession.user.id,
            provider: supabaseSession.user.app_metadata?.provider || 'unknown'
          };
        }

        user.value = userProfile;
        session.value = {
          access_token: supabaseSession.access_token,
          refresh_token: supabaseSession.refresh_token,
          expires_at: supabaseSession.expires_at!,
        };
      }
    }
    catch (error) {
      console.error('检查当前会话失败:', error);
    }
    finally {
      isCheckingSession = false;
    }
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

          if (data.timestamp && (Date.now() - data.timestamp > sevenDaysInMs)) {
            localStorage.removeItem('auth-session');
            return { user: null, session: null };
          }

          if (data.session && data.session.expires_at <= Date.now() / 1000) {
            localStorage.removeItem('auth-session');
            return { user: null, session: null };
          }

          return { user: data.user, session: data.session };
        }
        catch (error) {
          console.error('反序列化用户会话失败:', error);
          localStorage.removeItem('auth-session');
          return { user: null, session: null };
        }
      },
    },
  },
});
