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

    <!-- 主要内容区域 -->
    <div class="main-layout">
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
              <button 
                class="action-btn edit-btn"
                @click="editApplication(app)"
                @click.stop
                title="编辑应用"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button 
                class="action-btn delete-btn"
                @click="deleteApplication(app)"
                @click.stop
                title="删除应用"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
            <div class="app-content" @click="selectApp(app)">
              <div class="app-icon">
                <div class="app-emoji">🤖</div>
              </div>
              <div class="app-info">
                <h3>{{ app.name }}</h3>
                <p>{{ app.description || '暂无描述' }}</p>
                
                <!-- Tags 标签 - 固定高度区域 -->
                <div class="app-tags">
                  <span 
                    v-for="tag in (app.tags || [])" 
                    :key="tag" 
                    class="app-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
                
                <!-- 作者信息 - 固定高度区域 -->
                <div class="app-author">
                  <template v-if="app.author_name">
                    <i class="icon-author"></i>
                    <span>{{ app.author_name }}</span>
                  </template>
                </div>
                
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
    icon: '🤖',
    type: app.app_type,
    tags: app.tags || [],
    authorName: app.author_name || '',
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
  flex: 1;
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.app-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e8eaed;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  height: 280px;
}

.app-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
  border-color: rgba(102, 126, 234, 0.3);
}

.app-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.app-card:hover .app-actions {
  opacity: 1;
  transform: translateY(0);
}

.app-content {
  padding: 24px;
  cursor: pointer;
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(0.5px);
}

.app-card:hover .app-content::before {
  opacity: 1;
}

.app-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  flex-shrink: 0;
}

.app-emoji {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.app-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.app-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  flex-shrink: 0;
}

.app-info p {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
  flex-shrink: 0;
}

/* Tags 标签样式 */
.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
  height: 20px;
  overflow: hidden;
  flex-shrink: 0;
}

.app-tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  text-transform: lowercase;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1.2;
}

.app-tag:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

/* 作者信息样式 */
.app-author {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 11px;
  height: 16px;
  flex-shrink: 0;
  overflow: hidden;
}

.app-author i {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.app-author span {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  margin-top: auto;
  flex-shrink: 0;
}

.app-type {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.app-date {
  font-weight: 500;
}

/* 编辑删除按钮美化 - 现代化设计 */
.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  outline: none;
}

.action-btn svg {
  width: 18px;
  height: 18px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1;
}

.action-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.edit-btn {
  color: #2563eb;
}

.edit-btn::before {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.edit-btn:hover {
  color: white;
}

.edit-btn:hover::before {
  opacity: 1;
}

.edit-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.delete-btn {
  color: #dc2626;
}

.delete-btn::before {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.delete-btn:hover {
  color: white;
}

.delete-btn:hover::before {
  opacity: 1;
}

.delete-btn:active {
  transform: translateY(-1px) scale(1.02);
}

/* 按钮焦点状态 */
.action-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.delete-btn:focus-visible {
  outline-color: #dc2626;
}

/* 按钮加载和点击动画 */
.action-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.action-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.3s ease, height 0.3s ease;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.action-btn:active::after {
  width: 80%;
  height: 80%;
}

/* 图标旋转动画 */
.edit-btn:hover svg {
  transform: rotate(10deg);
}

.delete-btn:hover svg {
  transform: scale(1.1);
}

/* 移除旧的按钮样式 */
.app-actions .el-button {
  display: none;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 0;
  color: #9ca3af;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
  margin: 20px 0;
  transition: all 0.3s ease;
}

.empty-state:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* 加载状态优化 */
.app-grid[v-loading] .app-card {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 卡片进入动画 */
.app-card {
  animation: card-fade-in 0.5s ease-out;
}

@keyframes card-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 点击波纹效果 */
.app-content {
  position: relative;
  overflow: hidden;
}

.app-content::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.app-content:active::after {
  width: 200%;
  height: 200%;
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
.icon-author::before { content: '👤'; }

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
  
  .main-content {
    padding: 20px;
  }
  
  .app-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .app-card {
    margin: 0 4px;
    height: 260px;
  }
  
  .app-content {
    padding: 20px;
  }
  
  .app-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
  }
  
  .app-emoji {
    font-size: 24px;
  }
  
  .app-info h3 {
    font-size: 16px;
  }
  
  .app-tags {
    margin-bottom: 10px;
  }
  
  .app-tag {
    font-size: 10px;
    padding: 2px 6px;
  }
  
  .app-author {
    font-size: 11px;
    margin-bottom: 10px;
  }
  
  .app-actions {
    opacity: 1;
    top: 12px;
    right: 12px;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  
  .action-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .empty-state {
    padding: 60px 20px;
    margin: 16px 0;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .empty-state p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 16px;
  }
  
  .app-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 0 8px;
  }
  
  .app-card {
    height: 240px;
  }
  
  .app-content {
    padding: 16px;
  }
  
  .app-actions .el-button {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
  
  .action-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .app-info h3 {
    font-size: 15px;
  }
  
  .app-info p {
    font-size: 13px;
  }
  
  .app-meta {
    font-size: 11px;
  }
  
  .app-type {
    font-size: 10px;
    padding: 3px 8px;
  }
}
</style>