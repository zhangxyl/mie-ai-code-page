<template>
  <div class="pagination-wrapper" v-if="total > 0">
    <a-pagination
      v-model:current="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :show-size-changer="showSizeChanger"
      :show-total="showTotal ? totalRenderer : undefined"
      :page-size-options="pageSizeOptions"
      @change="handleChange"
      @show-size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  current: number
  pageSize: number
  total: number
  showSizeChanger?: boolean
  showTotal?: boolean
  pageSizeOptions?: string[]
}

interface Emits {
  (e: 'update:current', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change', page: number, size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  showSizeChanger: true,
  showTotal: true,
  pageSizeOptions: () => ['10', '20', '50', '100'],
})

const emit = defineEmits<Emits>()

const currentPage = computed({
  get: () => props.current,
  set: (value) => emit('update:current', value),
})

const pageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('update:pageSize', value),
})

const totalRenderer = (total: number, range: [number, number]) => {
  return `共 ${total} 条，第 ${range[0]}-${range[1]} 条`
}

const handleChange = (page: number, size: number) => {
  emit('change', page, size)
}

const handleSizeChange = (current: number, size: number) => {
  emit('change', current, size)
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px 0;
}
</style>
