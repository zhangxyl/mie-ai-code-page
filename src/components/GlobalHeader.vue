<template>
  <div class="global-header">
    <div class="header-content">
      <!-- 左侧 Logo 和标题 -->
      <div class="logo-section">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <span class="site-title">羊咩咩AI应用生成</span>
      </div>

      <!-- 中间菜单 -->
      <div class="menu-section">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          class="header-menu"
          @click="handleMenuClick"
        />
      </div>

      <!-- 右侧用户区域 -->
      <div class="user-section">
        <a-button type="primary" @click="handleLogin"> 登录 </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type {MenuProps} from 'ant-design-vue'

const router = useRouter()
// 当前选中菜单
const selectedKeys = ref<string[]>(['/'])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  selectedKeys.value = [to.path]
})
// 菜单配置
const menuItems = reactive([
  {
    key: 'home',
    label: '首页',
    title: '首页',
  },
  {
    key: 'resources',
    label: '资源',
    title: '资源',
  },
  {
    key: 'about',
    label: '关于',
    title: '关于',
  },
])

// 登录按钮处理
const handleLogin = () => {
  // 这里处理登录逻辑
  console.log('点击登录')
}
// 处理菜单点击
const handleMenuClick: MenuProps['onClick'] = (e) => {
  const key = e.key as string
  selectedKeys.value = [key]
  // 跳转到对应页面
  if (key.startsWith('/')) {
    router.push(key)
  }
}


</script>

<style scoped>
.global-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.logo {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

.site-title {
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
  white-space: nowrap;
}

.menu-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-menu {
  border-bottom: none;
  background: transparent;
  min-width: 400px;
}

.user-section {
  min-width: 100px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .header-content {
    padding: 0 16px;
  }

  .logo-section {
    min-width: 150px;
  }

  .site-title {
    font-size: 16px;
  }

  .header-menu {
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }

  .logo-section {
    min-width: 120px;
  }

  .site-title {
    font-size: 14px;
  }

  .menu-section {
    display: none; /* 在小屏幕上隐藏菜单，可以后续添加移动端菜单 */
  }
}

@media (max-width: 576px) {
  .header-content {
    padding: 0 8px;
  }

  .logo-section {
    min-width: 100px;
  }

  .logo {
    height: 28px;
    width: 28px;
  }

  .site-title {
    font-size: 12px;
  }
}
</style>
