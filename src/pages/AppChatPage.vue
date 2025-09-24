<template>
  <div class="app-chat-page">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <div class="header-left">
        <a-button type="text" @click="goBack" class="back-btn">
          <template #icon>
            <ArrowLeftOutlined />
          </template>
          返回
        </a-button>
        <div class="app-info">
          <h2 class="app-title">{{ appInfo?.appName || '应用生成中...' }}</h2>
          <span class="app-status" :class="getStatusClass()">
            {{ getStatusText() }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <a-button v-if="previewUrl" type="default" @click="openInNewTab" class="preview-btn">
          <template #icon>
            <EyeOutlined />
          </template>
          预览
        </a-button>
        <a-button type="default" @click="showAppDetailModal" class="detail-btn">
          <template #icon>
            <InfoCircleOutlined />
          </template>
          应用详情
        </a-button>
        <a-button
          type="primary"
          :loading="deploying"
          @click="deployApp"
          :disabled="!canDeploy"
          class="deploy-btn"
        >
          <template #icon>
            <CloudUploadOutlined />
          </template>
          {{ deploying ? '部署中...' : '部署应用' }}
        </a-button>
      </div>
    </div>

    <div class="chat-content">
      <!-- 左侧对话区域 -->
      <div class="chat-section">
        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0 && !isGenerating" class="welcome-message">
            <div class="welcome-content">
              <div class="welcome-icon">
                <RobotOutlined />
              </div>
              <h3>欢迎使用 AI 应用生成器</h3>
              <p>我将帮助您创建和完善您的应用。请描述您想要的功能或修改需求。</p>
            </div>
          </div>

          <!-- 消息列表 -->
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
          >
            <div class="message-avatar">
              <a-avatar v-if="message.role === 'user'" :src="loginUserStore.loginUser.userAvatar">
                {{ loginUserStore.loginUser.userName?.charAt(0) || 'U' }}
              </a-avatar>
              <a-avatar v-else class="ai-avatar">
                <RobotOutlined />
              </a-avatar>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTimeShort(message.timestamp) }}</div>
            </div>
          </div>

          <!-- AI 正在回复的消息 -->
          <div v-if="isGenerating" class="message ai-message generating">
            <div class="message-avatar">
              <a-avatar class="ai-avatar">
                <RobotOutlined />
              </a-avatar>
            </div>
            <div class="message-content">
              <div class="message-text">
                <div v-if="!currentAiMessage" class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div v-if="currentAiMessage" v-html="formatMessage(currentAiMessage)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <div class="input-section">
          <div class="input-wrapper">
            <a-tooltip v-if="!canEdit" title="无法在别人的作品下对话哦~" placement="top">
              <a-textarea
                v-model:value="inputMessage"
                placeholder="描述您想要的功能或修改需求..."
                :rows="3"
                :maxlength="2000"
                @keydown.enter.ctrl="sendMessage"
                :disabled="isGenerating || !canEdit"
                class="message-input"
                :class="{ 'disabled-input': !canEdit }"
                show-count
              />
            </a-tooltip>
            <a-textarea
              v-else
              v-model:value="inputMessage"
              placeholder="描述您想要的功能或修改需求..."
              :rows="3"
              :maxlength="2000"
              @keydown.enter.ctrl="sendMessage"
              :disabled="isGenerating"
              class="message-input"
              show-count
            />
            <div class="input-actions">
              <a-tooltip title="Ctrl + Enter 快速发送">
                <a-button
                  type="primary"
                  @click="sendMessage"
                  :loading="isGenerating"
                  :disabled="!inputMessage.trim() || !canEdit"
                  size="large"
                  class="send-btn"
                >
                  <template #icon>
                    <SendOutlined />
                  </template>
                  发送
                </a-button>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧网页展示区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <div class="preview-title">
            <h3>实时预览</h3>
            <a-tag v-if="lastUpdateTime" color="green" class="update-tag">
              {{ formatTimeShort(lastUpdateTime) }} 更新
            </a-tag>
          </div>
          <div class="preview-actions">
            <a-button v-if="previewUrl" type="link" @click="refreshPreview" :loading="refreshing">
              <template #icon>
                <ReloadOutlined />
              </template>
              刷新
            </a-button>
            <a-button v-if="previewUrl" type="link" @click="openInNewTab">
              <template #icon>
                <ExportOutlined />
              </template>
              新窗口打开
            </a-button>
          </div>
        </div>
        <div class="preview-container">
          <div v-if="isGenerating && !previewUrl" class="preview-loading">
            <a-spin size="large" />
            <p>正在生成应用...</p>
          </div>
          <iframe
            v-else-if="previewUrl"
            :src="previewUrl"
            class="preview-iframe"
            frameborder="0"
            @load="onPreviewLoad"
          ></iframe>
          <div v-else class="preview-placeholder">
            <div class="placeholder-content">
              <AppstoreOutlined />
              <h4>应用预览</h4>
              <p>开始对话后，生成的应用将在此处实时展示</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 应用详情模态框 -->
    <AppDetailModal
      v-model="appDetailModalVisible"
      :app-info="appInfo"
      :can-edit="canEdit"
      :is-admin="isAdmin"
      @edit="editAppFromDetail"
      @delete="deleteAppFromDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  AppstoreOutlined,
  RobotOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { getAppVoById, deployApp as deployAppApi, deleteApp } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'

import request from '@/request'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'
import { formatTime } from '@/utils/time'
import dayjs from 'dayjs'
import AppDetailModal from '@/components/AppDetailModal.vue'
const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用信息
const appInfo = ref<API.AppVO>()
// 保持为字符串类型以避免大整数精度丢失
const appId = ref<string | number>(route.params.id as string)
// 权限控制
const canEdit = ref(true)
const isAdmin = ref(false)

// 应用详情模态框
const appDetailModalVisible = ref(false)

// 消息列表
interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isGenerating = ref(false)
const currentAiMessage = ref('')

// 预览相关
const previewUrl = ref('')
const canDeploy = ref(false)
const deploying = ref(false)
const refreshing = ref(false)
const lastUpdateTime = ref<Date>()

// DOM 引用
const messagesContainer = ref<HTMLElement>()

// EventSource 引用
let eventSource: EventSource | null = null

// 获取应用信息
const fetchAppInfo = async () => {
  try {
    const res = await getAppVoById({ id: appId.value })
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data

      // 权限校验：检查是否是自己的作品
      const currentUserId = loginUserStore.loginUser.id
      const appUserId = appInfo.value.userId
      canEdit.value = currentUserId === appUserId

      // 检查是否是管理员（假设管理员角色为 'admin'）
      isAdmin.value = loginUserStore.loginUser.userRole === 'admin'

      // 检查是否有 view=1 查询参数，如果有则不自动发送消息
      const hasViewParam = route.query.view === '1'

      // 根据路由判断是否自动发送初始提示词
      // 只有在 /app/chat/:id 路由（新创建应用）时才自动发送
      // 在 /app/edit/:id 路由（编辑现有应用）时不自动发送
      // 如果有 view=1 参数，则不自动发送
      const isNewApp = route.name === '应用对话'
      const isEditApp = route.name === '应用编辑'

      if (appInfo.value.initPrompt && messages.value.length === 0 && isNewApp && !hasViewParam) {
        await sendInitialMessage(appInfo.value.initPrompt)
      } else if (isEditApp && appInfo.value.initPrompt) {
        // 编辑模式：将初始提示词设置到输入框中，但不自动发送
        inputMessage.value = appInfo.value.initPrompt
      }

      // 设置预览URL
      updatePreviewUrl()
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    message.error('获取应用信息失败')
    router.push('/')
  }
}

// 更新预览URL
const updatePreviewUrl = () => {
  if (appInfo.value?.codeGenType) {
    const timestamp = Date.now()
    const baseUrl = getStaticPreviewUrl(appInfo.value.codeGenType, String(appId.value))
    previewUrl.value = `${baseUrl}?t=${timestamp}`
    canDeploy.value = true
    lastUpdateTime.value = new Date()
  }
}

// 更新预览
const updatePreview = () => {
  updatePreviewUrl()
}

// 发送初始消息
const sendInitialMessage = async (prompt: string) => {
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: prompt,
    timestamp: new Date(),
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(prompt)
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isGenerating.value) {
    return
  }

  const message = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  })

  await nextTick()
  scrollToBottom()

  // 开始生成
  isGenerating.value = true
  await generateCode(message)
}

// 生成代码 - 使用 EventSource 处理流式响应
const generateCode = async (userMessage: string) => {
  let eventSource: EventSource | null = null
  let streamCompleted = false

  try {
    // 获取 axios 配置的 baseURL
    const baseURL = request.defaults.baseURL || API_BASE_URL
    // 构建URL参数
    const params = new URLSearchParams({
      appId: String(appId.value) || '',
      message: userMessage,
    })

    const url = `${baseURL}/app/chat/gen/code?${params}`

    // 创建 EventSource 连接
    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    let fullContent = ''

    // 处理接收到的消息
    eventSource.onmessage = function (event) {
      if (streamCompleted) return

      try {
        // 解析JSON包装的数据
        const parsed = JSON.parse(event.data)
        const content = parsed.d

        // 拼接内容
        if (content !== undefined && content !== null) {
          fullContent += content
          currentAiMessage.value = fullContent
          scrollToBottom()
        }
      } catch (error) {
        console.error('解析消息失败:', error)
        handleError(error)
      }
    }

    // 处理done事件
    eventSource.addEventListener('done', function () {
      if (streamCompleted) return

      streamCompleted = true
      isGenerating.value = false
      eventSource?.close()

      // 将AI消息添加到消息列表
      if (currentAiMessage.value) {
        messages.value.push({
          role: 'ai',
          content: currentAiMessage.value,
          timestamp: new Date(),
        })
      }
      currentAiMessage.value = ''

      // 延迟更新预览，确保后端已完成处理
      setTimeout(async () => {
        await fetchAppInfo()
        updatePreviewUrl()
      }, 1000)
    })

    // 处理business-error事件（后端限流等错误）
    eventSource.addEventListener('business-error', function (event: MessageEvent) {
      if (streamCompleted) return

      try {
        const errorData = JSON.parse(event.data)
        console.error('SSE业务错误事件:', errorData)

        // 显示具体的错误信息
        const errorMessage = errorData.message || '生成过程中出现错误'
        currentAiMessage.value = `❌ ${errorMessage}`

        // 将错误消息添加到消息列表
        messages.value.push({
          role: 'ai',
          content: currentAiMessage.value,
          timestamp: new Date(),
        })
        currentAiMessage.value = ''

        message.error(errorMessage)

        streamCompleted = true
        isGenerating.value = false
        eventSource?.close()
      } catch (parseError) {
        console.error('解析错误事件失败:', parseError, '原始数据:', event.data)
        handleError(new Error('服务器返回错误'))
      }
    })

    // 处理错误
    eventSource.onerror = function () {
      if (streamCompleted || !isGenerating.value) return
      // 检查是否是正常的连接关闭
      if (eventSource?.readyState === EventSource.CONNECTING) {
        streamCompleted = true
        isGenerating.value = false
        eventSource?.close()

        // 将当前消息添加到列表
        if (currentAiMessage.value) {
          messages.value.push({
            role: 'ai',
            content: currentAiMessage.value,
            timestamp: new Date(),
          })
        }
        currentAiMessage.value = ''

        setTimeout(async () => {
          await fetchAppInfo()
          updatePreviewUrl()
        }, 1000)
      } else {
        handleError(new Error('SSE连接错误'))
      }
    }
  } catch (error) {
    console.error('创建 EventSource 失败：', error)
    handleError(error)
  }
}

// 错误处理函数
const handleError = (error: unknown) => {
  console.error('生成代码失败：', error)

  // 添加错误消息到消息列表
  messages.value.push({
    role: 'ai',
    content: '抱歉，生成过程中出现了错误，请重试。',
    timestamp: new Date(),
  })

  currentAiMessage.value = ''
  message.error('生成失败，请重试')
  isGenerating.value = false
}

// 部署应用
const deployApp = async () => {
  if (!appId.value) return

  deploying.value = true
  try {
    const res = await deployAppApi({ appId: appId.value })
    if (res.data.code === 0) {
      message.success('部署成功！')
      if (res.data.data) {
        message.info(`访问地址：${res.data.data}`)
      }
    } else {
      message.error('部署失败：' + res.data.message)
    }
  } catch (error) {
    message.error('部署失败，请重试')
  } finally {
    deploying.value = false
  }
}

// 刷新预览
const refreshPreview = () => {
  refreshing.value = true
  updatePreviewUrl()
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

// 在新窗口打开预览
const openInNewTab = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

// 返回首页
const goBack = () => {
  router.push('/')
}

// 预览加载完成
const onPreviewLoad = () => {
  refreshing.value = false
}

// 获取状态类名
const getStatusClass = () => {
  if (isGenerating.value) return 'status-generating'
  if (canDeploy.value) return 'status-ready'
  return 'status-pending'
}

// 获取状态文本
const getStatusText = () => {
  if (isGenerating.value) return '生成中'
  if (canDeploy.value) return '就绪'
  return '待生成'
}

// 格式化消息内容
const formatMessage = (content: string) => {
  return content
    .replace(/\n/g, '<br>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

// 格式化时间（简短版本）
const formatTimeShort = (time: Date) => {
  return dayjs(time).format('HH:mm:ss')
}

// 格式化详细时间
const formatDetailTime = (time?: string) => {
  if (!time) return '未知'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 显示应用详情模态框
const showAppDetailModal = () => {
  appDetailModalVisible.value = true
}

// 从详情页编辑应用
const editAppFromDetail = () => {
  if (!appId.value) {
    message.error('应用信息不存在')
    return
  }

  // 权限检查：只有应用创建者或管理员可以编辑
  const currentUserId = loginUserStore.loginUser.id
  const isAppOwner = currentUserId === appInfo.value?.userId
  const isAdminUser = loginUserStore.loginUser.userRole === 'admin'

  if (!isAppOwner && !isAdminUser) {
    message.error('您没有权限编辑此应用')
    return
  }

  appDetailModalVisible.value = false
  router.push(`/app/edit/${appId.value}`)
}

// 从详情页删除应用
const deleteAppFromDetail = async () => {
  if (!appId.value) return

  try {
    const res = await deleteApp({ id: appId.value })
    if (res.data.code === 0) {
      message.success('删除成功')
      appDetailModalVisible.value = false
      router.push('/')
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败，请重试')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

// 组件卸载时清理
onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})

onMounted(() => {
  fetchAppInfo()
})
</script>

<style scoped>
.app-chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
  border-radius: 0 0 20px 20px;
  margin: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  color: rgba(255, 255, 255, 0.8);
}

.back-btn:hover {
  color: #ffffff;
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.app-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-generating {
  background: #fef3c7;
  color: #d97706;
}

.status-ready {
  background: #d1fae5;
  color: #059669;
}

.status-pending {
  background: #e5e7eb;
  color: #6b7280;
}

.header-right {
  display: flex;
  gap: 12px;
}

.preview-btn,
.detail-btn,
.deploy-btn {
  border-radius: 8px;
}

.chat-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.chat-section {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e2e8f0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 300px;
}

.welcome-content {
  text-align: center;
  color: #64748b;
  max-width: 400px;
}

.welcome-icon {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.welcome-content h3 {
  margin: 0 0 12px;
  color: #1e293b;
  font-weight: 600;
}

.welcome-content p {
  margin: 0;
  line-height: 1.6;
}

.message {
  display: flex;
  gap: 12px;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 20px 20px 6px 20px;
}

.ai-message .message-content {
  background: #f8fafc;
  color: #1e293b;
  border-radius: 20px 20px 20px 6px;
  border: 1px solid #e2e8f0;
}

.generating .message-content {
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.message-avatar {
  flex-shrink: 0;
}

.ai-avatar {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
}

.message-content {
  max-width: 75%;
  padding: 14px 18px;
  word-wrap: break-word;
}

.message-text {
  line-height: 1.6;
  margin-bottom: 6px;
}

.message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  overflow-x: auto;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-section {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.input-wrapper {
  position: relative;
}

.message-input {
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  transition: all 0.2s;
}

.message-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.send-btn {
  border-radius: 8px;
  height: 40px;
  padding: 0 20px;
}

.disabled-input {
  cursor: not-allowed;
  opacity: 0.6;
}

.disabled-input:hover {
  border-color: #d1d5db !important;
}

.preview-section {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: white;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.update-tag {
  font-size: 11px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-container {
  flex: 1;
  position: relative;
  background: #f8fafc;
}

.preview-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #64748b;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #9ca3af;
}

.placeholder-content .anticon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #d1d5db;
}

.placeholder-content h4 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
}

.placeholder-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 应用详情模态框样式 */
.app-detail-content {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  min-height: 32px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #1e293b;
  flex: 1;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.creator-avatar {
  flex-shrink: 0;
}

.creator-name {
  color: #1e293b;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons .ant-btn {
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .chat-content {
    flex-direction: column;
  }

  .chat-section,
  .preview-section {
    width: 100%;
  }

  .preview-section {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }

  .header-right {
    flex-direction: column;
    gap: 8px;
  }

  .messages-container {
    padding: 16px;
  }

  .input-section {
    padding: 16px;
  }

  .app-detail-modal .ant-modal {
    margin: 16px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .ant-btn {
    width: 100%;
  }
}
</style>
