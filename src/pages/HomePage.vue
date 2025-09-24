<template>
  <div id="homePage">
    <div class="container">
      <!-- 网站标题和描述 -->
      <div class="hero-section">
        <h1 class="hero-title">一句话 🤖 呈所想</h1>
        <p class="hero-description">与 AI 对话轻松创建网站应用和网站</p>

        <!-- 用户提示词输入框 -->
        <div class="input-section">
          <div class="input-container">
            <a-textarea
              v-model:value="promptText"
              class="prompt-input"
              placeholder="请输入您想要创建的应用..."
              :rows="1"
              :auto-size="{ minRows: 1, maxRows: 4 }"
              :maxlength="500"
              :bordered="false"
            />
            <a-button
              type="primary"
              shape="circle"
              size="large"
              :loading="creating"
              @click="createApp"
              :disabled="!promptText.trim()"
              class="send-button"
            >
              <template #icon>
                <SendOutlined />
              </template>
            </a-button>
          </div>
        </div>
        =======

        <!-- 快捷按钮 -->
        <div class="quick-actions">
          <a-button @click="setQuickPrompt('个人博客网站')" class="quick-btn"
            >个人博客网站</a-button
          >
          <a-button @click="setQuickPrompt('企业官网')" class="quick-btn">企业官网</a-button>
          <a-button @click="setQuickPrompt('在线聊天')" class="quick-btn">在线聊天</a-button>
          <a-button @click="setQuickPrompt('作品展示网站')" class="quick-btn"
            >作品展示网站</a-button
          >
        </div>
      </div>

      <!-- 我的作品 -->
      <div class="section">
        <h2 class="section-title">我的作品</h2>
        <div class="app-grid">
          <AppCard
            v-for="app in myApps"
            :key="app.id"
            :app="app"
            :show-actions="true"
            @edit="editApp"
            @delete="deleteMyApp"
            @view="viewApp"
          />
        </div>
        <PaginationWrapper
          v-if="myApps.length > 0"
          v-model:current="myAppsPagination.current"
          v-model:page-size="myAppsPagination.pageSize"
          :total="myAppsPagination.total"
          :show-size-changer="false"
          @change="loadMyApps"
        />
      </div>

      <!-- 精选案例 -->
      <div class="section">
        <h2 class="section-title">精选案例</h2>
        <div class="featured-grid">
          <AppCard
            v-for="app in featuredApps"
            :key="app.id"
            :app="app"
            :show-actions="false"
            @view="viewApp"
          />
        </div>
        <PaginationWrapper
          v-if="featuredApps.length > 0"
          v-model:current="featuredPagination.current"
          v-model:page-size="featuredPagination.pageSize"
          :total="featuredPagination.total"
          :show-size-changer="false"
          @change="loadFeaturedApps"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PaperClipOutlined, SmileOutlined, SendOutlined } from '@ant-design/icons-vue'
import { addApp, listMyAppVoByPage, listAppVoByPage, deleteApp } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'
import AppCard from '@/components/AppCard.vue'
import PaginationWrapper from '@/components/PaginationWrapper.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 提示词输入
const promptText = ref('')
const creating = ref(false)

// 我的应用数据
const myApps = ref<API.AppVO[]>([])
const myAppsPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
})

// 精选应用数据
const featuredApps = ref<API.AppVO[]>([])
const featuredPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
})

// 设置快捷提示词
const setQuickPrompt = (prompt: string) => {
  promptText.value = prompt
}

// 创建应用
const createApp = async () => {
  if (!promptText.value.trim()) {
    message.warning('请输入应用描述')
    return
  }

  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    router.push('/user/login')
    return
  }

  creating.value = true
  try {
    const res = await addApp({ initPrompt: promptText.value.trim() })
    if (res.data.code === 0) {
      message.success('应用创建成功')
      // 跳转到对话页面
      router.push(`/app/chat/${res.data.data}`)
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (error) {
    message.error('创建失败，请重试')
  } finally {
    creating.value = false
  }
}

// 加载我的应用
const loadMyApps = async (page = 1) => {
  if (!loginUserStore.loginUser.id) {
    return
  }

  try {
    const res = await listMyAppVoByPage({
      pageNum: page,
      pageSize: myAppsPagination.value.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    })
    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPagination.value.total = Number(res.data.data.totalRow) || 0
      myAppsPagination.value.current = page
    }
  } catch (error) {
    console.error('加载我的应用失败:', error)
  }
}

// 加载精选应用
const loadFeaturedApps = async (page = 1) => {
  try {
    const res = await listAppVoByPage({
      pageNum: page,
      pageSize: featuredPagination.value.pageSize,
      priority: 99, // 精选应用优先级为99
      sortField: 'createTime',
      sortOrder: 'desc',
    })
    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredPagination.value.total = Number(res.data.data.totalRow) || 0
      featuredPagination.value.current = page
    }
  } catch (error) {
    console.error('加载精选应用失败:', error)
  }
}

// 编辑应用
const editApp = (app: API.AppVO) => {
  if (!app.id) {
    message.error('应用ID不存在，无法编辑')
    return
  }
  router.push(`/app/edit/${app.id}`)
}

// 删除我的应用
const deleteMyApp = async (app: API.AppVO) => {
  if (!app.id) {
    message.error('应用ID不存在，无法删除')
    return
  }

  try {
    const res = await deleteApp({ id: app.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      loadMyApps(myAppsPagination.value.current)
    } else {
      message.error('删除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('删除失败，请重试')
  }
}

// 查看应用
const viewApp = (app: API.AppVO) => {
  if (!app.id) {
    message.error('应用ID不存在，无法查看')
    return
  }
  // 添加 view=1 查询参数，防止自动发送消息
  router.push(`/app/chat/${app.id}?view=1`)
}

onMounted(() => {
  loadFeaturedApps()
  if (loginUserStore.loginUser.id) {
    loadMyApps()
  }
})
</script>

<style scoped>
#homePage {
  width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 科技感网格背景 */
#homePage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.04) 1px, transparent 1px);
  background-size:
    100px 100px,
    100px 100px,
    20px 20px,
    20px 20px;
  pointer-events: none;
  animation: gridFloat 20s ease-in-out infinite;
}

/* 动态光效 */
#homePage::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(59, 130, 246, 0.08) 0%,
      rgba(139, 92, 246, 0.06) 40%,
      transparent 80%
    ),
    linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.04) 50%, transparent 70%),
    linear-gradient(-45deg, transparent 30%, rgba(139, 92, 246, 0.04) 50%, transparent 70%);
  pointer-events: none;
  animation: lightPulse 8s ease-in-out infinite alternate;
}

@keyframes gridFloat {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(5px, 5px);
  }
}

@keyframes lightPulse {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.7;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

/* 移除居中光束效果 */

/* 英雄区域 */
.hero-section {
  text-align: center;
  padding: 80px 0 60px;
  margin-bottom: 28px;
  color: #1e293b;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse 800px 400px at center, rgba(59, 130, 246, 0.12) 0%, transparent 70%),
    linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.05) 50%, transparent 70%),
    linear-gradient(-45deg, transparent 30%, rgba(16, 185, 129, 0.04) 50%, transparent 70%);
  animation: heroGlow 10s ease-in-out infinite alternate;
}

@keyframes heroGlow {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.hero-title {
  font-size: 48px;
  font-weight: 600;
  margin: 0 0 16px;
  line-height: 1.2;
  color: white;
  letter-spacing: -1px;
  position: relative;
  z-index: 2;
}

@keyframes titleShimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.hero-description {
  font-size: 18px;
  margin: 0 0 40px;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 2;
}

/* 输入区域 */
.input-section {
  position: relative;
  margin: 0 auto 32px;
  max-width: 600px;
}

.input-container {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 16px 60px 16px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.input-container:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.input-container:focus-within {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.prompt-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  background: transparent;
  color: #333;
}

.prompt-input::placeholder {
  color: #999;
}

.send-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: #1890ff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-button:hover {
  background: #40a9ff;
  transform: translateY(-50%) scale(1.05);
}

.send-button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.send-button .anticon {
  font-size: 16px;
  color: white;
}

/* 快捷按钮 */
.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.quick-btn {
  border-radius: 20px;
  padding: 8px 16px;
  height: auto;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-size: 14px;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 区域标题 */
.section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #1e293b;
}

/* 我的作品网格 */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 精选案例网格 */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-description {
    font-size: 16px;
  }

  .app-grid,
  .featured-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    justify-content: center;
  }
}
</style>
