<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <div class="logo">ShortLink Admin</div>
      <!-- 这里可以放导航或者其他头部内容 -->
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
:root {
  --color-text: #333333;
  --color-border: #cccccc;
  --section-gap: 24px;
}

header {
  background-color: #f5f5f5;
  color: var(--color-text);
  line-height: 1.5;
  max-height: 100vh;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--section-gap);
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  user-select: none;
}

main {
  padding: var(--section-gap);
  min-height: calc(100vh - 60px); /* 预估 header 高度 */
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  color: var(--color-text);
  text-decoration: none;
}

nav a:first-of-type {
  border: 0;
}

nav a {
  font-weight: bold;
  text-decoration: underline;
}

@media (min-width: 1024px) {
  header {
    padding-right: calc(var(--section-gap) / 2);
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
