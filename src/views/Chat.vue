<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>智能聊天</h2>
      <p>与 AI 助手开始对话</p>
    </div>
    
    <div class="chat-content">
      <p>聊天功能正在开发中...</p>
      <el-button @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: #f5f7fa;
}

.chat-header {
  text-align: center;
  margin-bottom: 40px;
}

.chat-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 16px;
}

.chat-header p {
  font-size: 16px;
  color: #7f8c8d;
}

.chat-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
</style>