<template>
  <div class="app">
    <header>
      <h1>
        <i class="fa-solid fa-ranking-star"></i> Система рейтинга лесничеств
      </h1>
      <div class="user-info">
        <span v-if="authStore.user">
          {{ authStore.user.email }}
          ({{ getRoleName(authStore.user.role) }})
        </span>
        <span v-else>Гость (просмотр)</span>

        <button
          v-if="authStore.isAuthenticated"
          @click="logout"
          class="logout-btn"
        >
          Выйти
        </button>
        <button v-else @click="showAuth = true" class="login-btn">Войти</button>
      </div>
    </header>

    <Auth :show="showAuth" @close="showAuth = false" @login="handleLogin" />

    <main>
      <div class="tabs">
        <button
          @click="currentTab = 'table'"
          :class="{ active: currentTab === 'table' }"
        >
          <i class="fa-solid fa-file-excel"></i>
          Таблица данных
        </button>
        <button
          @click="currentTab = 'stats'"
          :class="{ active: currentTab === 'stats' }"
        >
          <i class="fa-solid fa-chart-column"></i>
          Статистика
        </button>
        <button
          v-if="authStore.user?.role === 'admin'"
          @click="currentTab = 'admin'"
          :class="{ active: currentTab === 'admin' }"
        >
          ⚙️ Управление
        </button>
      </div>

      <div v-if="dataStore.loading" class="loading">Загрузка данных...</div>

      <div v-else class="content">
        <RatingTable v-if="currentTab === 'table'" />
        <StatsView v-if="currentTab === 'stats'" />
        <AdminPanel v-if="currentTab === 'admin'" />
      </div>
    </main>
    <!-- Блок об авторе -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-info">
          <i class="fa-solid fa-ranking-star"></i>
          <span>Система рейтинга лесничеств</span>
        </div>

        <div class="developer-info">
          <i class="fas fa-code"></i>
          <span>Разработчик: <strong>Kurbanou Farid</strong></span>
        </div>

        <div class="footer-links">
          <a href="https://github.com/Kurbanou" target="_blank">
            <i class="fab fa-github"></i>
          </a>
          <span class="version">v1.0.0</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "./stores/authStore";
import { useDataStore } from "./stores/dataStore";
import Auth from "./components/Auth.vue";
import RatingTable from "./components/RatingTable.vue";
import AdminPanel from "./components/admin/AdminPanel.vue";
import StatsView from "./components/StatsView.vue";

const authStore = useAuthStore();
const dataStore = useDataStore();
const showAuth = ref(false);
const currentTab = ref("table");

onMounted(async () => {
  await authStore.checkAuth();
  await dataStore.loadAllData();
});

const handleLogin = () => {
  // Данные уже загружены, можно обновить если нужно
  // dataStore.loadAllData(true);
};

const logout = () => {
  authStore.logout();
  currentTab.value = "table";
};

const getRoleName = (role) => {
  const roles = {
    admin: "Администратор",
    engineer: "Инженер",
    viewer: "Наблюдатель",
  };
  return roles[role] || role;
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f0f2f5;
  color: #333;
}

.app {
  min-height: 100vh;
}

header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  row-gap: 10px;
  text-align: center;
}

header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
  text-transform: uppercase;
}
header h1 i {
  color: #ff9800;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn,
.login-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn {
  background: #f44336;
  color: white;
}

.logout-btn:hover {
  background: #da190b;
}

.login-btn {
  background: #4caf50;
  color: white;
}

.login-btn:hover {
  background: #45a049;
}

.tabs {
  /* background: white; */
  padding: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.tabs button {
  padding: 10px;
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #667;
  /* border-bottom: 2px solid transparent; */
  transition: all 0.5s;
  user-select: none;
  border-radius: 3px;
  position: relative;
}

.tabs button::after {
  content: "";
  position: absolute;
  height: 2px;
  width: 0;
  background-color: #ff9800;
  left: 0;
  bottom: 0;
  transition: all 0.3s;
}

.tabs button:hover::after,
.tabs button.active::after {
  width: 100%;
  background-color: #ff9800;
}

.tabs button.active::after {
  width: 100%;
  background-color: #45a049;
}

.tabs button:hover {
  color: #ff9800;
}

.tabs button.active {
  /* background-color: #45a049; */
  color: #45a049;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.content {
  /* padding: 20px; */
  max-width: 1200px;
  margin: 0 auto;
}

.app-footer {
  margin-top: 40px;
  padding: 20px;
  background: #2c3e50;
  color: #ecf0f1;
  border-top: 3px solid #4caf50;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
  gap: 15px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-info i {
  color: #4caf50;
  font-size: 18px;
}

.developer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
}

.developer-info i {
  color: #ff9800;
}

.developer-info strong {
  color: #fff;
  font-weight: 600;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-links a {
  color: #ecf0f1;
  font-size: 20px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #4caf50;
}

.version {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-left: 5px;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 500px) {
  header h1 {
    font-size: 1em;
  }

  .tabs {
    padding: 10px;
  }
}
</style>
