<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h2>⚙️ Панель управления</h2>
      <div class="admin-tabs">
        <button
          @click="currentTab = 'sections'"
          :class="{ active: currentTab === 'sections' }"
        >
          <i class="fa-solid fa-folder-tree"></i>
          Разделы
        </button>
        <button
          @click="currentTab = 'indicators'"
          :class="{ active: currentTab === 'indicators' }"
        >
          <i class="fa-solid fa-bars-progress"></i>
          Показатели
        </button>
        <button
          @click="currentTab = 'forestries'"
          :class="{ active: currentTab === 'forestries' }"
        >
          <i class="fa-solid fa-sitemap"></i>
          Лесничества
        </button>
        <button
          @click="currentTab = 'users'"
          :class="{ active: currentTab === 'users' }"
        >
          <i class="fa-solid fa-users"></i>
          Пользователи
        </button>
      </div>
    </div>

    <div class="admin-content">
      <!-- Управление разделами -->
      <SectionsManager
        v-if="currentTab === 'sections'"
        @changed="handleDataChanged"
      />

      <!-- Управление показателями -->
      <IndicatorsManager
        v-if="currentTab === 'indicators'"
        @changed="handleDataChanged"
      />

      <!-- Управление лесничествами -->
      <ForestriesManager
        v-if="currentTab === 'forestries'"
        @changed="handleDataChanged"
      />

      <!-- Управление пользователями -->
      <UsersManager
        v-if="currentTab === 'users'"
        @changed="handleDataChanged"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SectionsManager from "./SectionsManager.vue";
import IndicatorsManager from "./IndicatorsManager.vue";
import ForestriesManager from "./ForestriesManager.vue";
import UsersManager from "./UsersManager.vue";

const currentTab = ref("sections");

const handleDataChanged = () => {
  console.log("Данные изменены");
};
</script>

<style scoped>
.admin-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.admin-header {
  background: #2c3e50;
  color: white;
  padding: 20px;
}

.admin-header h2 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-tabs button {
  padding: 10px 20px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.admin-tabs button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.admin-tabs button.active {
  background: #4caf50;
  color: white;
}

.admin-content {
  padding: 20px;
  min-height: 500px;
}
</style>
