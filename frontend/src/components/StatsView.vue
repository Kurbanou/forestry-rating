<template>
  <div class="stats-view">
    <h2>📈 Статистика</h2>

    <div class="stats-tabs">
      <button
        @click="activeTab = 'quarterly'"
        :class="{ active: activeTab === 'quarterly' }"
      >
        📊 По кварталам
      </button>
      <button
        @click="activeTab = 'trend'"
        :class="{ active: activeTab === 'trend' }"
      >
        📈 Динамика
      </button>
    </div>

    <div class="stats-content">
      <QuarterlyComparison v-if="activeTab === 'quarterly'" />
      <TrendChart v-if="activeTab === 'trend'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import QuarterlyComparison from "./QuarterlyComparison.vue";
import TrendChart from "./TrendChart.vue";

const activeTab = ref("quarterly");
</script>

<style scoped>
.stats-view {
  padding: 20px;
}

.stats-view h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.stats-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.stats-tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.stats-tabs button:hover {
  background: #f5f5f5;
}

.stats-tabs button.active {
  background: #4caf50;
  color: white;
}

.stats-content {
  min-height: 500px;
}
</style>
