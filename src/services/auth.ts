import type { AuthResponse, LoginRequest, OAuthLoginRequest, RegisterRequest, UserProfile } from '../interfaces/auth';
import { supabase } from '../config/supabase';

export class AuthService {
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

      const userProfile = await this.getUserProfile(data.user.id);

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
    }
    catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : '登录失败',
      };
    }
  }

  async loginWithOAuth(request: OAuthLoginRequest): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: request.provider,
        options: {
          redirectTo: request.redirectTo || `${window.location.origin}/`,
        },
      });

      return { error: error?.message };
    }
    catch (error) {
      return { error: error instanceof Error ? error.message : '第三方登录失败' };
    }
  }

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

      if (data.user && !data.session) {
        return {
          user: null,
          session: null,
          error: '注册成功，请查收邮件激活账户',
        };
      }

      const userProfile = data.user ? await this.getUserProfile(data.user.id) : null;

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
    }
    catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : '注册失败',
      };
    }
  }

  async logout(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message };
    }
    catch (error) {
      return { error: error instanceof Error ? error.message : '登出失败' };
    }
  }

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

      const userProfile = data.user ? await this.getUserProfile(data.user.id) : null;

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
    }
    catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : '刷新会话失败',
      };
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user ? await this.getUserProfile(user.id) : null;
    }
    catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<{ error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: '用户未登录' };
      }

      // 首先获取用户的profile_id
      const { data: mapping } = await supabase
        .from('user_auth_mappings')
        .select('profile_id')
        .eq('auth_user_id', user.id)
        .single();

      if (!mapping) {
        return { error: '用户资料不存在' };
      }

      // 更新profiles表
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', mapping.profile_id);

      return { error: error?.message };
    }
    catch (error) {
      return { error: error instanceof Error ? error.message : '更新资料失败' };
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // 使用auth_user_id查询profiles表
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.warn('查询用户资料失败:', error.message);
        return null;
      }

      return {
        ...data,
        auth_user_id: userId
      };
    }
    catch (error) {
      console.warn('获取用户资料失败:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let userProfile = await this.getUserProfile(session.user.id);
        
        // 如果查询失败或没有记录，触发器应该已经创建了记录
        // 但如果仍然没有，我们创建一个临时的用户资料
        if (!userProfile && session.user) {
          userProfile = {
            id: session.user.id, // 这里使用auth_user_id
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
            avatar: session.user.user_metadata?.avatar_url || '',
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
            auth_user_id: session.user.id,
            provider: session.user.app_metadata?.provider || 'unknown'
          };
        }

        callback(userProfile);
      }
      else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
