<template>
  <div id="app">
    <div v-if="isPopup">
      <router-view />
    </div>
    <div v-else-if="route.path === '/login'">
      <router-view />
    </div>
    <HomeView v-else-if="route.path === '/'" />
    <Layout v-else>
      <router-view />
    </Layout>
    <AlertModal />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeView from './components/views/HomeView.vue'
import Layout from './layout/Layout.vue'
import AlertModal from './components/common/AlertModal.vue'

const route = useRoute()

const isPopup = computed(() => {
  return route.path === '/DashboardPopupView' || route.path === '/Dashboard2View'
})
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

