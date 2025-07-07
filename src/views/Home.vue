<template>
  <div class="home-container">
    <div class="home-header">
      <h1>欢迎来到 Vue Dify 聊天机器人</h1>
      <p>您已成功登录！</p>
    </div>
    
    <div class="user-info">
      <el-card class="user-card">
        <template #header>
          <div class="card-header">
            <span>用户信息</span>
            <el-button type="danger" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </template>
        
        <div class="user-details">
          <p><strong>邮箱:</strong> {{ user?.email }}</p>
          <p v-if="user?.name"><strong>姓名:</strong> {{ user.name }}</p>
          <p><strong>注册时间:</strong> {{ formatDate(user?.created_at) }}</p>
        </div>
      </el-card>
    </div>
    
    <div class="actions">
      <el-button type="primary" size="large" @click="goToChat">
        开始聊天
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, logout } = useAuth()

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleLogout = async () => {
  const result = await logout()
  if (result.success) {
    ElMessage.success('退出成功')
  } else {
    ElMessage.error(result.error || '退出失败')
  }
}

const goToChat = () => {
  router.push('/chat')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.home-header h1 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 16px;
}

.home-header p {
  font-size: 18px;
  color: #7f8c8d;
}

.user-info {
  max-width: 600px;
  margin: 0 auto 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-details {
  font-size: 16px;
  line-height: 1.6;
}

.actions {
  text-align: center;
}
</style>