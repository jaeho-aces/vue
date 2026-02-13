<template>
  <div class="mgmt-container">
    <div class="mgmt-tabs-container">
      <div class="mgmt-tabs-header">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="setTab(tab)"
          :class="['mgmt-tab-button', { active: currentTab === tab }]"
        >
          {{ tab }}
        </button>
      </div>
      <div class="mgmt-tabs-content">
        <component :is="tabContent[currentTab]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CommonCode from './general/CommonCode.vue'
import HeadquartersInfo from './general/HeadquartersInfo.vue'
import BranchInfo from './general/BranchInfo.vue'
import RouteInfo from './general/RouteInfo.vue'
import TerminalInfo from './general/TerminalInfo.vue'
import UserAccount from './general/UserAccount.vue'

// Tab 배열
const tabs = [
  '공통 코드',
  '본부 정보',
  '지사 정보',
  '노선 정보',
  '운영단말',
  '사용자 계정'
] as const

// TabContent Record
const tabContent: Record<string, any> = {
  '공통 코드': CommonCode,
  '본부 정보': HeadquartersInfo,
  '지사 정보': BranchInfo,
  '노선 정보': RouteInfo,
  '운영단말': TerminalInfo,
  '사용자 계정': UserAccount
}

// useState(tabs[0]) → ref(tabs[0])
const currentTab = ref<string>(tabs[0])

// setTab 함수
const setTab = (tab: string) => {
  currentTab.value = tab
}
</script>
