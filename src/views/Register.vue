<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import type { RegisterRequest } from '../interfaces/auth';
import { Lock, Message, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const { register, loginWithOAuth, loading, submitting, clearError } = useAuth();

const registerFormRef = ref<FormInstance>();
const registerForm = ref<RegisterRequest & { confirmPassword: string }>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

function validateConfirmPassword(rule: any, value: string, callback: any) {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  }
  else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致'));
  }
  else {
    callback();
  }
}

const registerRules: FormRules = {
  name: [
    { max: 50, message: '用户名长度不能超过50个字符', trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: ['blur', 'change'] },
    { max: 50, message: '密码长度不能超过50位', trigger: ['blur', 'change'] },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: ['blur', 'change'] },
  ],
};

const isFormValid = computed(() => {
  return registerForm.value.email
    && registerForm.value.password
    && registerForm.value.confirmPassword
    && registerForm.value.password.length >= 6
    && registerForm.value.password === registerForm.value.confirmPassword;
});

async function handleRegister() {
  if (!registerFormRef.value)
    return;

  try {
    const isValid = await registerFormRef.value.validate();
    if (!isValid)
      return;

    clearError();

    const { confirmPassword, ...registerData } = registerForm.value;
    const result = await register(registerData);

    if (result.success) {
      ElMessage.success('注册成功');
    }
    else {
      ElMessage.error(result.error || '注册失败');
    }
  }
  catch (err) {
    ElMessage.error('注册失败，请重试');
  }
}

async function handleGitHubLogin() {
  try {
    clearError()
    const result = await loginWithOAuth({
      provider: 'github',
      redirectTo: `${window.location.origin}/`
    })
    
    if (!result.success) {
      ElMessage.error(result.error || 'GitHub 登录失败')
    }
  } catch (err) {
    ElMessage.error('GitHub 登录失败，请重试')
  }
}

async function handleGoogleLogin() {
  try {
    clearError()
    const result = await loginWithOAuth({
      provider: 'google',
      redirectTo: `${window.location.origin}/`
    })
    
    if (!result.success) {
      ElMessage.error(result.error || 'Google 登录失败')
    }
  } catch (err) {
    ElMessage.error('Google 登录失败，请重试')
  }
}

onMounted(() => {
  clearError();
});
</script>

<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <div class="register-header">
        <h1 class="register-title">
          创建账户
        </h1>
        <p class="register-subtitle">
          加入我们，开始您的智能对话之旅
        </p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        size="large"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入用户名（可选）"
            :prefix-icon="User"
            :disabled="loading || submitting"
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱"
            :prefix-icon="Message"
            :disabled="loading || submitting"
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            :disabled="loading || submitting"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            :prefix-icon="Lock"
            :disabled="loading || submitting"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item class="register-actions">
          <el-button
            type="primary"
            class="register-button"
            :loading="loading || submitting"
            :disabled="!isFormValid"
            @click="handleRegister"
          >
            {{ (loading || submitting) ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="oauth-section">
        <div class="divider">
          <span class="divider-text">或</span>
        </div>
        
        <div class="oauth-buttons">
          <el-button
            class="oauth-button github-button"
            :loading="loading || submitting"
            @click="handleGitHubLogin"
          >
            <svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            使用 GitHub 注册
          </el-button>
          
          <el-button
            class="oauth-button google-button"
            :loading="loading || submitting"
            @click="handleGoogleLogin"
          >
            <svg class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            使用 Google 注册
          </el-button>
        </div>
      </div>

      <div class="register-footer">
        <p class="login-link">
          已有账户？
          <router-link to="/login" class="link">
            立即登录
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-form-wrapper {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.register-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.register-actions {
  margin-bottom: 0;
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.oauth-section {
  margin: 24px 0;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #7f8c8d;
  font-size: 14px;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.oauth-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.oauth-icon {
  width: 20px;
  height: 20px;
}

.github-button {
  background: #24292e;
  color: white;
  border: 1px solid #24292e;
}

.github-button:hover {
  background: #1a1e22;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(36, 41, 46, 0.3);
}

.google-button {
  background: white;
  color: #5f6368;
  border: 1px solid #dadce0;
}

.google-button:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.register-footer {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 24px;
}

.login-link {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link:hover {
  color: #5a6fd8;
}

@media (max-width: 480px) {
  .register-form-wrapper {
    padding: 30px 20px;
  }

  .register-title {
    font-size: 24px;
  }
}
</style>
