<template>
  <div id="app">
    <DashboardPopupView v-if="route.path === '/dashboard-popup'" />
    <HomeView v-else-if="navigationStore.currentPage === 'home'" />
    <Layout v-else />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useNavigationStore } from './stores/navigation'
import HomeView from './components/views/HomeView.vue'
import DashboardPopupView from './components/views/DashboardPopupView.vue'
import Layout from './layout/Layout.vue'

const route = useRoute()
const navigationStore = useNavigationStore()
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

