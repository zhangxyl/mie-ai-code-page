<template>
  <a-modal
    v-model:open="visible"
    title="应用详情"
    :footer="null"
    width="500px"
    @cancel="handleClose"
  >
    <div class="app-detail-content">
      <!-- 应用基础信息 -->
      <div class="detail-section">
        <h4 class="section-title">基础信息</h4>
        <div class="info-item">
          <span class="info-label">应用名称：</span>
          <span class="info-value">{{ appInfo?.appName || '未命名应用' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">创建者：</span>
          <div class="creator-info">
            <UserInfo :user="appInfo?.user" :size="24" />
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">创建时间：</span>
          <span class="info-value">{{ formatTime(appInfo?.createTime) }}</span>
        </div>
        <div class="info-item" v-if="appInfo?.updateTime">
          <span class="info-label">更新时间：</span>
          <span class="info-value">{{ formatTime(appInfo?.updateTime) }}</span>
        </div>
        <div class="info-item" v-if="appInfo?.deployedTime">
          <span class="info-label">部署时间：</span>
          <span class="info-value">{{ formatTime(appInfo?.deployedTime) }}</span>
        </div>
      </div>

      <!-- 操作栏（仅本人或管理员可见） -->
      <div class="detail-section" v-if="showActions && (canEdit || isAdmin)">
        <h4 class="section-title">操作</h4>
        <div class="action-buttons">
          <a-button type="primary" @click="handleEdit">
            <template #icon>
              <EditOutlined />
            </template>
            修改应用
          </a-button>
          <a-popconfirm
            title="确定要删除这个应用吗？删除后无法恢复！"
            ok-text="确定删除"
            cancel-text="取消"
            @confirm="handleDelete"
          >
            <a-button danger>
              <template #icon>
                <DeleteOutlined />
              </template>
              删除应用
            </a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { formatTime } from '@/utils/time'
import UserInfo from './UserInfo.vue'

interface Props {
  modelValue: boolean
  appInfo?: API.AppVO
  canEdit?: boolean
  isAdmin?: boolean
  showActions?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', appInfo: API.AppVO): void
  (e: 'delete', appInfo: API.AppVO): void
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: false,
  isAdmin: false,
  showActions: true,
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleClose = () => {
  visible.value = false
}

const handleEdit = () => {
  if (props.appInfo) {
    emit('edit', props.appInfo)
  }
}

const handleDelete = () => {
  if (props.appInfo) {
    emit('delete', props.appInfo)
  }
}
</script>

<style scoped>
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
  margin-bottom: 16px;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
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
  color: #666;
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #1a1a1a;
  flex: 1;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .ant-btn {
  flex: 1;
}
</style>
