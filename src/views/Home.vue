<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-left">
        <div class="nav-items">
          <div class="nav-item active">
            <i class="icon-app"></i>
            全部
          </div>
          <div class="nav-item">
            <i class="icon-workspace"></i>
            工作台
          </div>
          <div class="nav-item">
            <i class="icon-chatflow"></i>
            Chatflow
          </div>
          <div class="nav-item">
            <i class="icon-agent"></i>
            智能助手
          </div>
          <div class="nav-item">
            <i class="icon-agent"></i>
            Agent
          </div>
          <div class="nav-item">
            <i class="icon-doc"></i>
            文档生成
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <span>{{ user?.email }}</span>
          <el-button type="text" @click="handleLogout">
            退出登录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 侧边栏和主要内容区域 -->
    <div class="main-layout">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-item">
          <i class="icon-create"></i>
          创建应用
        </div>
        <div class="sidebar-item">
          <i class="icon-import"></i>
          从应用已创建
        </div>
        <div class="sidebar-item">
          <i class="icon-import"></i>
          从应用模板创建
        </div>
        <div class="sidebar-item">
          <i class="icon-dsl"></i>
          导入 DSL 文件
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <div class="content-header">
          <h2>我的应用</h2>
          <el-button type="primary" @click="showAddDialog = true">
            <i class="icon-plus"></i>
            添加应用
          </el-button>
        </div>

        <!-- 应用网格 -->
        <div class="app-grid" v-loading="loading">
          <div 
            v-for="app in applications" 
            :key="app.id"
            class="app-card"
          >
            <div class="app-actions">
              <el-button 
                type="text" 
                size="small" 
                @click="editApplication(app)"
                @click.stop
              >
                编辑
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                @click="deleteApplication(app)"
                @click.stop
                class="delete-btn"
              >
                删除
              </el-button>
            </div>
            <div class="app-content" @click="selectApp(app)">
              <div class="app-icon">
                <img :src="app.icon_url" :alt="app.name" />
              </div>
              <div class="app-info">
                <h3>{{ app.name }}</h3>
                <p>{{ app.description || '暂无描述' }}</p>
                <div class="app-meta">
                  <span class="app-type">{{ getDifyAppModeName(app.app_type) }}</span>
                  <span class="app-date">{{ formatDate(app.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="applications.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">
              <i class="icon-dsl"></i>
            </div>
            <p>暂无 Dify 应用，点击"添加应用"开始使用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加应用对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加 Dify 应用"
      width="500px"
    >
      <el-form :model="appForm" label-width="100px">
        <el-form-item label="Base URL" required>
          <el-input v-model="appForm.baseUrl" placeholder="请输入 Dify 服务器地址，例如：https://api.dify.ai" />
        </el-form-item>
        <el-form-item label="API Key" required>
          <el-input v-model="appForm.apiKey" placeholder="请输入 API Key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleAddCancel">取消</el-button>
        <el-button type="primary" @click="addApplication" :loading="loading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑应用对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑 Dify 应用"
      width="500px"
    >
      <el-form :model="appForm" label-width="100px">
        <el-form-item label="应用名称">
          <el-input v-model="appForm.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="Base URL">
          <el-input v-model="appForm.baseUrl" placeholder="请输入 Dify 服务器地址" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="appForm.apiKey" placeholder="请输入 API Key" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="appForm.description" 
            type="textarea" 
            placeholder="请输入应用描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleEditCancel">取消</el-button>
        <el-button type="primary" @click="updateApplication" :loading="loading">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { DifyAppService } from '../services/dify-app'
import type { DifyApp } from '../interfaces/dify-app'
import { getDifyAppModeName } from '../utils/dify-app-mode'

const router = useRouter()
const { user, logout } = useAuth()

// 应用列表
const applications = ref<DifyApp[]>([])
const loading = ref(false)

// 对话框状态
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editingApp = ref<DifyApp | null>(null)

// 表单数据
const appForm = ref({
  baseUrl: '',
  apiKey: '',
  name: '',
  description: ''
})

// 加载应用列表
onMounted(() => {
  loadApplications()
})

const loadApplications = async () => {
  loading.value = true
  try {
    const response = await DifyAppService.getUserApps()
    if (response.success) {
      applications.value = response.data as DifyApp[]
    } else {
      ElMessage.error(response.error || '加载应用列表失败')
    }
  } catch (error) {
    ElMessage.error('加载应用列表异常')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
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

const selectApp = (app: DifyApp) => {
  // 设置选中的应用并跳转到聊天界面
  localStorage.setItem('selected-dify-app', JSON.stringify({
    id: app.id,
    name: app.name,
    description: app.description,
    baseUrl: app.base_url,
    apiKey: app.api_key,
    icon: app.icon_url,
    type: app.app_type,
    updatedAt: app.updated_at
  }))
  router.push('/chat')
}

const addApplication = async () => {
  if (!appForm.value.baseUrl || !appForm.value.apiKey) {
    ElMessage.error('请填写 Base URL 和 API Key')
    return
  }

  loading.value = true
  try {
    // 创建应用（会自动从 Dify API 获取应用信息）
    const response = await DifyAppService.createApp({
      base_url: appForm.value.baseUrl,
      api_key: appForm.value.apiKey
    })

    if (response.success) {
      ElMessage.success('应用添加成功')
      resetForm()
      showAddDialog.value = false
      await loadApplications()
    } else {
      ElMessage.error(response.error || '应用添加失败')
    }
  } catch (error) {
    ElMessage.error('应用添加异常')
  } finally {
    loading.value = false
  }
}

const editApplication = (app: DifyApp) => {
  editingApp.value = app
  appForm.value = {
    name: app.name,
    baseUrl: app.base_url,
    apiKey: app.api_key,
    description: app.description || ''
  }
  showEditDialog.value = true
}

const updateApplication = async () => {
  if (!editingApp.value || !appForm.value.name || !appForm.value.baseUrl || !appForm.value.apiKey) {
    ElMessage.error('请填写所有必需字段')
    return
  }

  loading.value = true
  try {
    // 首先测试连接
    const testResult = await DifyAppService.testAppConnection(appForm.value.baseUrl, appForm.value.apiKey)
    if (!testResult.success) {
      ElMessage.error(testResult.error || '连接测试失败')
      return
    }

    // 更新应用
    const response = await DifyAppService.updateApp(editingApp.value.id, {
      name: appForm.value.name,
      description: appForm.value.description,
      base_url: appForm.value.baseUrl,
      api_key: appForm.value.apiKey
    })

    if (response.success) {
      ElMessage.success('应用更新成功')
      resetForm()
      showEditDialog.value = false
      editingApp.value = null
      await loadApplications()
    } else {
      ElMessage.error(response.error || '应用更新失败')
    }
  } catch (error) {
    ElMessage.error('应用更新异常')
  } finally {
    loading.value = false
  }
}

const deleteApplication = async (app: DifyApp) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除应用 "${app.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await DifyAppService.deleteApp(app.id)

    if (response.success) {
      ElMessage.success('应用删除成功')
      await loadApplications()
    } else {
      ElMessage.error(response.error || '应用删除失败')
    }
  } catch (error) {
    // 用户取消删除
    if (error !== 'cancel') {
      ElMessage.error('应用删除异常')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  appForm.value = {
    baseUrl: '',
    apiKey: '',
    name: '',
    description: ''
  }
}

const handleAddCancel = () => {
  resetForm()
  showAddDialog.value = false
}

const handleEditCancel = () => {
  resetForm()
  showEditDialog.value = false
  editingApp.value = null
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.header {
  background: white;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 56px;
}

.header-left {
  display: flex;
  align-items: center;
}

.nav-items {
  display: flex;
  gap: 32px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.active {
  background-color: #1890ff;
  color: white;
}

.header-right .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 主要布局 */
.main-layout {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e5e5;
  padding: 24px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.sidebar-item:hover {
  background-color: #f5f5f5;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

/* 应用网格 */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.app-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  position: relative;
  transition: all 0.2s;
}

.app-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.app-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.app-card:hover .app-actions {
  opacity: 1;
}

.app-content {
  padding: 24px;
  cursor: pointer;
}

.delete-btn {
  color: #f56c6c !important;
}

.delete-btn:hover {
  color: #f56c6c !important;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.app-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.app-type {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 图标样式 */
.icon-app::before { content: '📱'; }
.icon-workspace::before { content: '💼'; }
.icon-chatflow::before { content: '💬'; }
.icon-agent::before { content: '🤖'; }
.icon-doc::before { content: '📄'; }
.icon-create::before { content: '➕'; }
.icon-import::before { content: '📥'; }
.icon-dsl::before { content: '📋'; }
.icon-plus::before { content: '➕'; }

/* 响应式布局 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: 12px;
  }
  
  .nav-items {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding: 12px 0;
  }
  
  .sidebar-item {
    white-space: nowrap;
    min-width: 120px;
  }
  
  .app-grid {
    grid-template-columns: 1fr;
  }
}
</style>