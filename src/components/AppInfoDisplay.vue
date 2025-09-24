<template>
  <div class="app-info">
    <div class="app-cover">
      <a-image v-if="app.cover" :src="app.cover" :width="width" :height="height" />
      <div v-else class="no-cover" :style="{ width: width + 'px', height: height + 'px' }">
        <AppstoreOutlined />
      </div>
    </div>
    <div class="app-details">
      <div class="app-name">{{ app.appName || '未命名应用' }}</div>
      <div class="app-prompt" v-if="showPrompt">{{ app.initPrompt || '暂无描述' }}</div>
      <div class="app-meta" v-if="showMeta">
        <span class="create-time">{{ formatTime(app.createTime) }}</span>
        <UserInfo v-if="showCreator" :user="app.user" :size="'small'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppstoreOutlined } from '@ant-design/icons-vue'
import { formatTime } from '@/utils/time'
import UserInfo from './UserInfo.vue'

interface Props {
  app: API.AppVO
  width?: number
  height?: number
  showPrompt?: boolean
  showMeta?: boolean
  showCreator?: boolean
}

withDefaults(defineProps<Props>(), {
  width: 60,
  height: 60,
  showPrompt: true,
  showMeta: true,
  showCreator: true,
})
</script>

<style scoped>
.app-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.app-cover {
  flex-shrink: 0;
}

.no-cover {
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #999;
  border-radius: 4px;
}

.app-details {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #1890ff;
  cursor: pointer;
}

.app-name:hover {
  color: #40a9ff;
}

.app-prompt {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.create-time {
  color: #999;
}
</style>
