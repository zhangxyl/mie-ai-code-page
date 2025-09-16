<template>
  <div class="global-footer">
    <div class="footer-content">
      <p class="copyright">
        GITHUB by
        <a
          href="https://github.com/zhangxyl"
          target="_blank"
          rel="noopener noreferrer"
          class="author-link"
        >
          程序员小阳
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加一些底部相关的逻辑
</script>

<style scoped>
.global-footer {
  height: 70px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  max-width: 1200px;
  width: 100%;
  padding: 0 24px;
  text-align: center;
}

.copyright {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.author-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.author-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    padding: 0 16px;
  }

  .copyright {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .global-footer {
    height: 60px;
  }

  .footer-content {
    padding: 0 12px;
  }

  .copyright {
    font-size: 11px;
  }
}
</style>
