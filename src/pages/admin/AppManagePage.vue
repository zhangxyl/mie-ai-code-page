<template>
  <div id="appManagePage">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">应用管理</h1>
        <p class="page-description">管理平台上的所有应用</p>
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
            <a-form-item label="应用名称">
              <a-input v-model:value="searchParams.appName" placeholder="输入应用名称" />
            </a-form-item>
            <a-form-item label="创建者ID">
              <a-input v-model:value="searchParams.userId" placeholder="输入创建者ID" />
            </a-form-item>
            <a-form-item label="生成类型">
              <a-select
                v-model:value="searchParams.codeGenType"
                placeholder="选择生成类型"
                style="width: 150px"
              >
                <a-select-option value="">全部</a-select-option>
                <a-select-option
                  v-for="option in CODE_GEN_TYPE_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
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
              <AppInfoDisplay :app="record" :show-meta="false" :show-creator="false" />
            </template>
            <template v-else-if="column.dataIndex === 'user'">
              <div class="user-info">
                <a-avatar :src="record.user?.userAvatar" size="small">
                  {{ record.user?.userName?.charAt(0) || 'U' }}
                </a-avatar>
                <span>{{ record.user?.userName || '未知用户' }}</span>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'priority'">
              <div v-if="record.priority === 99">
                <a-tag color="gold">精选</a-tag>
              </div>
              <div v-else-if="record.priority === 1">
                <a-tag color="blue">普通</a-tag>
              </div>
              <div v-else>
                <a-tag color="default">隐藏</a-tag>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'createTime'">
              {{ formatTime(record.createTime) }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="doEdit(record)">编辑</a-button>
                <a-button danger size="small" @click="doDelete(record.id)">删除</a-button>
                <a-button
                  v-if="record.priority !== 99"
                  type="primary"
                  size="small"
                  @click="doSetFeatured(record)"
                >
                  精选
                </a-button>
                <a-button v-else size="small" @click="doUnsetFeatured(record)"> 取消精选 </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { listAppVoByPageAdmin, deleteAppByAdmin, updateAppByAdmin } from '@/api/appController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { CODE_GEN_TYPE_OPTIONS } from '@/utils/codeGenTypes'
import { formatTime } from '@/utils/time'
import UserInfo from '@/components/UserInfo.vue'
import AppInfoDisplay from '@/components/AppInfoDisplay.vue'
import SearchForm from '@/components/SearchForm.vue'
import PaginationWrapper from '@/components/PaginationWrapper.vue'

const router = useRouter()

const columns = [
  {
    title: '应用信息',
    dataIndex: 'appInfo',
    width: 300,
  },
  {
    title: '创建者',
    dataIndex: 'user',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 展示的数据
const data = ref<API.AppVO[]>([])
const total = ref(0)
const loading = ref(false)

// 搜索条件
const searchParams = reactive<API.AppQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listAppVoByPageAdmin({
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

// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.pageNum = 1
  fetchData()
}

// 编辑应用 - 跳转到应用信息修改页
const doEdit = (record: API.AppVO) => {
  // 跳转到应用编辑页面
  router.push(`/app/edit/${record.id}`)
}

// 删除数据
const doDelete = async (id: string | number) => {
  if (!id) {
    return
  }
  const res = await deleteAppByAdmin({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('删除失败')
  }
}

// 设置精选
const doSetFeatured = async (record: API.AppVO) => {
  const res = await updateAppByAdmin({
    id: Number(record.id),
    appName: record.appName,
    cover: record.cover,
    priority: 99, // 设置为精选
  })
  if (res.data.code === 0) {
    message.success('设置精选成功')
    fetchData()
  } else {
    message.error('设置精选失败')
  }
}

// 取消精选
const doUnsetFeatured = async (record: API.AppVO) => {
  const res = await updateAppByAdmin({
    id: Number(record.id),
    appName: record.appName,
    cover: record.cover,
    priority: 1, // 设置为普通
  })
  if (res.data.code === 0) {
    message.success('取消精选成功')
    fetchData()
  } else {
    message.error('取消精选失败')
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#appManagePage {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-container {
  max-width: 1200px;
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
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
  #appManagePage {
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
}
</style>
