<template>
  <a-layout class="basic-layout">
    <!-- 顶部导航栏 -->
    <a-layout-header class="header">
      <GlobalHeader />
    </a-layout-header>

    <!-- 主要内容区域 -->
    <a-layout-content class="content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </a-layout-content>

    <!-- 底部版权信息 -->
    <a-layout-footer class="footer">
      <GlobalFooter />
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content {
  flex: 1;
  margin-top: 64px; /* 为固定头部留出空间 */
  margin-bottom: 70px; /* 为固定底部留出空间 */
  padding: 24px;
  background: #f0f2f5;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 200px);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }

  .content-wrapper {
    padding: 16px;
    border-radius: 0;
    box-shadow: none;
  }
}

@media (max-width: 576px) {
  .content {
    padding: 8px;
  }

  .content-wrapper {
    padding: 12px;
  }
}
</style>
