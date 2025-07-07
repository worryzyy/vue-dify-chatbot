import type { AuthResponse, LoginRequest, OAuthLoginRequest, RegisterRequest, UserProfile, AuthStateChangeCallback } from '../interfaces/auth';
import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

export class AuthService {
  private authStateChangeCallbacks: AuthStateChangeCallback[] = [];

  /**
   * 邮箱密码登录
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      const userProfile = this.mapSupabaseUserToProfile(data.user);

      return {
        user: userProfile,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at!,
              user: userProfile!,
            }
          : null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : '登录失败',
      };
    }
  }

  /**
   * 第三方登录
   */
  async loginWithOAuth(request: OAuthLoginRequest): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: request.provider,
        options: {
          redirectTo: request.redirectTo || `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      return { error: error?.message };
    } catch (error) {
      return { error: error instanceof Error ? error.message : '第三方登录失败' };
    }
  }

  /**
   * 注册新用户
   */
  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || '',
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      // 如果注册成功但需要邮箱验证
      if (data.user && !data.session) {
        return {
          user: null,
          session: null,
          message: '注册成功，请查收邮件激活账户',
        };
      }

      const userProfile = this.mapSupabaseUserToProfile(data.user);

      return {
        user: userProfile,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at!,
              user: userProfile!,
            }
          : null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : '注册失败',
      };
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message };
    } catch (error) {
      return { error: error instanceof Error ? error.message : '登出失败' };
    }
  }

  /**
   * 刷新会话
   */
  async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message,
        };
      }

      const userProfile = this.mapSupabaseUserToProfile(data.user);

      return {
        user: userProfile,
        session: data.session
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at!,
              user: userProfile!,
            }
          : null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : '刷新会话失败',
      };
    }
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      // 首先检查是否有会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return null;
      }

      // 如果有会话，再获取用户信息
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return this.mapSupabaseUserToProfile(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * 更新用户资料（只更新 user_metadata）
   */
  async updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>): Promise<{ error?: string }> {
    try {
      // 将 avatar 字段映射为 avatar_url
      const userData: Record<string, any> = {};
      if (updates.name !== undefined) userData.name = updates.name;
      if (updates.avatar !== undefined) userData.avatar_url = updates.avatar;

      const { error } = await supabase.auth.updateUser({
        data: userData,
      });

      return { error: error?.message };
    } catch (error) {
      return { error: error instanceof Error ? error.message : '更新资料失败' };
    }
  }

  /**
   * 监听认证状态变化
   */
  onAuthStateChange(callback: AuthStateChangeCallback) {
    this.authStateChangeCallbacks.push(callback);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ? this.mapSupabaseUserToProfile(session.user) : null;
        const sessionData = session
          ? {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at!,
            }
          : null;

        // 调用所有回调
        for (const cb of this.authStateChangeCallbacks) {
          try {
            cb(event as any, sessionData, user);
          } catch (error) {
            console.error('认证状态变化回调执行失败:', error);
          }
        }
      }
    );

    // 返回取消订阅的函数
    return () => {
      subscription.unsubscribe();
      const index = this.authStateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.authStateChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 将 Supabase User 对象映射为 UserProfile
   */
  private mapSupabaseUserToProfile(user: User | null): UserProfile | null {
    if (!user) return null;

    // 获取正确的 provider 信息
    const getProvider = (user: User) => {
      // 从 identities 中获取 provider（最可靠的方式）
      if (user.identities && user.identities.length > 0) {
        const nonEmailProviders = user.identities.filter(
          (identity) => identity.provider !== 'email'
        );
        if (nonEmailProviders.length > 0) {
          return nonEmailProviders[0].provider;
        }
        return user.identities[0].provider;
      }

      // 从 app_metadata 中获取
      if (user.app_metadata?.provider) {
        return user.app_metadata.provider;
      }

      // 从 app_metadata.providers 中获取
      if (user.app_metadata?.providers && Array.isArray(user.app_metadata.providers)) {
        const nonEmailProviders = user.app_metadata.providers.filter(
          (p: string) => p !== 'email'
        );
        if (nonEmailProviders.length > 0) {
          return nonEmailProviders[nonEmailProviders.length - 1];
        }
        return user.app_metadata.providers[user.app_metadata.providers.length - 1];
      }

      return 'email';
    };

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || '',
      avatar: user.user_metadata?.avatar_url || '',
      provider: getProvider(user),
      created_at: user.created_at,
      updated_at: user.updated_at || new Date().toISOString(),
    };
  }
}

export const authService = new AuthService();