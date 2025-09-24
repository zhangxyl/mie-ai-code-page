<template>
  <div class="app-card">
    <div class="app-cover">
      <img v-if="app.cover" :src="app.cover" :alt="app.appName" @error="handleImageError" />
      <div v-else class="default-cover">
        <AppstoreOutlined />
      </div>
    </div>
    <div class="app-info">
      <h3 class="app-name">{{ app.appName || '未命名应用' }}</h3>
      <p class="app-creator">创建于 {{ formatTime(app.createTime) }}</p>

      <!-- 统一的按钮区域 -->
      <div class="card-actions">
        <a-button type="text" size="small" @click="$emit('view', app)">
          <template #icon>
            <MessageOutlined />
          </template>
          查看对话
        </a-button>
        <a-button v-if="app.deployKey" type="text" size="small" @click="viewDeployedApp">
          <template #icon>
            <EyeOutlined />
          </template>
          查看作品
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AppstoreOutlined,
  MessageOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getDeployUrl } from '@/config/env'

interface Props {
  app: API.AppVO
  showActions?: boolean
}

const props = defineProps<Props>()
defineEmits<{
  edit: [app: API.AppVO]
  delete: [app: API.AppVO]
  view: [app: API.AppVO]
}>()

const formatTime = (time?: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD')
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
  target.nextElementSibling?.classList.remove('hidden')
}

// 查看已部署的作品
const viewDeployedApp = () => {
  if (props.app.deployKey) {
    const deployUrl = getDeployUrl(props.app.deployKey)
    window.open(deployUrl, '_blank')
  }
}
</script>

<style scoped>
.app-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.app-cover {
  height: 160px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
}

.app-info {
  padding: 16px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-creator {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.card-actions .ant-btn {
  border-radius: 6px;
  font-size: 12px;
  height: 28px;
  padding: 0 8px;
}

.card-actions .ant-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
