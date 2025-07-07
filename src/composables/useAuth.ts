import type { LoginRequest, OAuthLoginRequest, RegisterRequest } from '../interfaces/auth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();

  const submitting = ref(false);

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const loading = computed(() => authStore.loading);
  const error = computed(() => authStore.error);
  const isSessionExpired = computed(() => authStore.isSessionExpired);

  const login = async (credentials: LoginRequest) => {
    submitting.value = true;

    try {
      const result = await authStore.login(credentials);

      if (result.success) {
        await router.push('/');
        return { success: true };
      }

      return { success: false, error: result.error };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      return { success: false, error: errorMessage };
    }
    finally {
      submitting.value = false;
    }
  };

  const register = async (credentials: RegisterRequest) => {
    submitting.value = true;

    try {
      const result = await authStore.register(credentials);

      if (result.success) {
        await router.push('/');
        return { success: true };
      }

      return { success: false, error: result.error };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '注册失败';
      return { success: false, error: errorMessage };
    }
    finally {
      submitting.value = false;
    }
  };

  const logout = async () => {
    submitting.value = true;

    try {
      const result = await authStore.logout();

      if (result.success) {
        await router.push('/login');
        return { success: true };
      }

      return { success: false, error: result.error };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登出失败';
      return { success: false, error: errorMessage };
    }
    finally {
      submitting.value = false;
    }
  };

  const loginWithOAuth = async (request: OAuthLoginRequest) => {
    submitting.value = true;

    try {
      const result = await authStore.loginWithOAuth(request);

      if (result.success) {
        return { success: true };
      }

      return { success: false, error: result.error };
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '第三方登录失败';
      return { success: false, error: errorMessage };
    }
    finally {
      submitting.value = false;
    }
  };

  const refreshSession = async () => {
    if (!isAuthenticated.value || !isSessionExpired.value) {
      return { success: true };
    }

    try {
      const result = await authStore.refreshSession();

      if (!result.success) {
        await router.push('/login');
      }

      return result;
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刷新会话失败';
      await router.push('/login');
      return { success: false, error: errorMessage };
    }
  };

  const checkAuthStatus = async () => {
    await authStore.checkCurrentSession();
    
    if (!authStore.isAuthenticated) {
      return { success: false, error: '用户未登录' };
    }

    if (authStore.isSessionExpired) {
      return await refreshSession();
    }

    return { success: true };
  };

  const requireAuth = async () => {
    const result = await checkAuthStatus();

    if (!result.success) {
      await router.push('/login');
      return false;
    }

    return true;
  };

  const updateProfile = async (updates: Parameters<typeof authStore.updateProfile>[0]) => {
    submitting.value = true;

    try {
      const result = await authStore.updateProfile(updates);
      return result;
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新资料失败';
      return { success: false, error: errorMessage };
    }
    finally {
      submitting.value = false;
    }
  };

  const clearError = () => {
    authStore.clearError();
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    submitting: computed(() => submitting.value),
    isSessionExpired,
    login,
    loginWithOAuth,
    register,
    logout,
    refreshSession,
    checkAuthStatus,
    requireAuth,
    updateProfile,
    clearError,
  };
}
