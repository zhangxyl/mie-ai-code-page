<template>
  <div id="chatHistoryManagePage">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">对话管理</h1>
        <p class="page-description">管理平台上的所有对话记录</p>
      </div>

      <div class="content-card">
        <!-- 搜索表单 -->
        <SearchForm
          :initial-params="{ pageNum: 1, pageSize: 10 }"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
        >
          <template #fields="{ searchParams }">
            <a-form-item label="应用ID">
              <a-input v-model:value="searchParams.appId" placeholder="输入应用ID" />
            </a-form-item>
            <a-form-item label="用户ID">
              <a-input v-model:value="searchParams.userId" placeholder="输入用户ID" />
            </a-form-item>
            <a-form-item label="消息类型">
              <a-select
                v-model:value="searchParams.messageType"
                placeholder="选择消息类型"
                style="width: 150px"
              >
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="user">用户消息</a-select-option>
                <a-select-option value="assistant">AI消息</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="消息内容">
              <a-input v-model:value="searchParams.message" placeholder="输入消息内容关键词" />
            </a-form-item>
          </template>
        </SearchForm>
        <a-divider />
        <!-- 表格 -->
        <a-table
          :columns="columns"
          :data-source="data"
          :pagination="pagination"
          @change="doTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'appInfo'">
              <div class="app-info">
                <div class="app-name">{{ record.app?.appName || '未知应用' }}</div>
                <div class="app-id">ID: {{ record.appId }}</div>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'user'">
              <div class="user-info">
                <a-avatar :src="record.user?.userAvatar" size="small">
                  {{ record.user?.userName?.charAt(0) || 'U' }}
                </a-avatar>
                <span>{{ record.user?.userName || '未知用户' }}</span>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'messageType'">
              <a-tag :color="record.messageType === 'user' ? 'blue' : 'green'">
                {{ record.messageType === 'user' ? '用户消息' : 'AI消息' }}
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'message'">
              <div class="message-content">
                <a-tooltip :title="record.message">
                  <div class="message-text">{{ truncateMessage(record.message) }}</div>
                </a-tooltip>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ formatTime(record.createTime) }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewDetail(record)">查看</a-button>
                <a-button danger size="small" @click="doDelete(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 对话详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="对话详情"
      :footer="null"
      width="800px"
      class="chat-detail-modal"
    >
      <div v-if="selectedRecord" class="detail-content">
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-item">
            <span class="info-label">对话ID：</span>
            <span class="info-value">{{ selectedRecord.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">应用名称：</span>
            <span class="info-value">{{ selectedRecord.app?.appName || '未知应用' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">用户：</span>
            <div class="user-info">
              <a-avatar :src="selectedRecord.user?.userAvatar" size="small">
                {{ selectedRecord.user?.userName?.charAt(0) || 'U' }}
              </a-avatar>
              <span class="creator-name">{{ selectedRecord.user?.userName || '未知用户' }}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">消息类型：</span>
            <a-tag :color="selectedRecord.messageType === 'user' ? 'blue' : 'green'">
              {{ selectedRecord.messageType === 'user' ? '用户消息' : 'AI消息' }}
            </a-tag>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatTime(selectedRecord.createTime) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">消息内容</h3>
          <div class="message-detail">
            <pre class="message-pre">{{ selectedRecord.message }}</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { listChatHistoryVoByPageAdmin, deleteChatHistoryByAdmin } from '@/api/chatHistoryController'
import { message } from 'ant-design-vue'
import { formatTime } from '@/utils/time'
import SearchForm from '@/components/SearchForm.vue'

const columns = [
  {
    title: '应用信息',
    dataIndex: 'appInfo',
    width: 200,
  },
  {
    title: '用户',
    dataIndex: 'user',
    width: 150,
  },
  {
    title: '消息类型',
    dataIndex: 'messageType',
    width: 100,
  },
  {
    title: '消息内容',
    dataIndex: 'message',
    width: 300,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
]

// 展示的数据
const data = ref<API.ChatHistoryVO[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchParams = reactive<API.ChatHistoryQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

// 详情模态框
const detailModalVisible = ref(false)
const selectedRecord = ref<API.ChatHistoryVO>()

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listChatHistoryVoByPageAdmin({
      ...searchParams,
    })
    if (res.data.data) {
      data.value = res.data.data.records ?? []
      total.value = Number(res.data.data.totalRow) ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = (params: Record<string, any>) => {
  Object.assign(searchParams, params)
  searchParams.pageNum = 1
  fetchData()
}

// 处理重置
const handleReset = () => {
  searchParams.pageNum = 1
  fetchData()
}

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.pageNum ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 表格分页变化时的操作
const doTableChange = (page: { current: number; pageSize: number }) => {
  searchParams.pageNum = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 删除数据
const doDelete = async (id: string | number) => {
  if (!id) {
    return
  }
  const res = await deleteChatHistoryByAdmin({ id: Number(id) })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}

// 查看详情
const viewDetail = (record: API.ChatHistoryVO) => {
  selectedRecord.value = record
  detailModalVisible.value = true
}

// 截断消息内容
const truncateMessage = (message: string | undefined) => {
  if (!message) return ''
  return message.length > 50 ? message.substring(0, 50) + '...' : message
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#chatHistoryManagePage {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
}

.page-title {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 12px;
  color: white;
}

.page-description {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.8);
}

.content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-name {
  font-weight: 500;
  color: #1e293b;
}

.app-id {
  font-size: 12px;
  color: #64748b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-name {
  color: #1e293b;
  font-weight: 500;
}

.message-content {
  max-width: 300px;
}

.message-text {
  word-break: break-all;
  line-height: 1.4;
}

/* 详情模态框样式 */
.detail-content {
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
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #1e293b;
  flex: 1;
}

.message-detail {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.message-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.6;
  color: #1e293b;
}

/* 表格样式优化 */
:deep(.ant-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f1f5f9;
}

:deep(.ant-divider) {
  border-color: #e2e8f0;
}

@media (max-width: 768px) {
  #chatHistoryManagePage {
    padding: 16px;
  }

  .content-card {
    padding: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-description {
    font-size: 16px;
  }

  .page-container {
    max-width: 100%;
  }
}
</style>
