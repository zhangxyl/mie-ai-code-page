<template>
  <div class="home-page">
    <div class="welcome-section">
      <h1 class="title">羊咩咩AI应用生成平台</h1>
      <p class="subtitle">零代码应用生成</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 首页逻辑
</script>

<style scoped>
.home-page {
  padding: 40px 0;
}

.welcome-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: #1890ff;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 48px;
  line-height: 1.6;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 48px;
}

.feature-card {
  background: #fff;
  padding: 32px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 24px 20px;
  }
}

@media (max-width: 576px) {
  .home-page {
    padding: 20px 0;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>
