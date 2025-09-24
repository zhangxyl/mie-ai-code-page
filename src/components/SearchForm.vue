<template>
  <a-form layout="inline" :model="searchParams" @finish="handleSearch">
    <slot name="fields" :searchParams="searchParams"></slot>
    <a-form-item>
      <a-button type="primary" html-type="submit" :loading="loading">
        <template #icon>
          <SearchOutlined />
        </template>
        搜索
      </a-button>
      <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'

interface Props {
  initialParams?: Record<string, any>
  loading?: boolean
}

interface Emits {
  (e: 'search', params: Record<string, any>): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialParams: () => ({}),
  loading: false,
})

const emit = defineEmits<Emits>()

const searchParams = reactive({ ...props.initialParams })

const handleSearch = () => {
  emit('search', { ...searchParams })
}

const handleReset = () => {
  Object.keys(searchParams).forEach((key) => {
    if (props.initialParams[key] !== undefined) {
      searchParams[key] = props.initialParams[key]
    } else {
      searchParams[key] = ''
    }
  })
  emit('reset')
}

// 暴露搜索参数给父组件
defineExpose({
  searchParams,
})
</script>
