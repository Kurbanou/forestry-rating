<template>
  <div class="app">
    <header>
      <h1>🌲 Система рейтинга лесничеств</h1>
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
          📊 Таблица данных
        </button>
        <button
          @click="currentTab = 'stats'"
          :class="{ active: currentTab === 'stats' }"
        >
          📈 Статистика
        </button>
        <button
          v-if="authStore.user?.role === 'admin'"
          @click="currentTab = 'admin'"
          :class="{ active: currentTab === 'admin' }"
        >
          ⚙️ Управление
        </button>
      </div>

      <div class="content">
        <RatingTable v-if="currentTab === 'table'" />

        <!-- 👇 Подключаем компонент статистики -->
        <StatsView v-if="currentTab === 'stats'" />

        <AdminPanel v-if="currentTab === 'admin'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "./stores/authStore";
import { useDataStore } from "./stores/dataStore";
import Auth from "./components/Auth.vue";
import RatingTable from "./components/RatingTable.vue";
import AdminPanel from "./components/admin/AdminPanel.vue";
// 👇 Импортируем новый компонент статистики
import StatsView from "./components/StatsView.vue";

const authStore = useAuthStore();
const dataStore = useDataStore();
const showAuth = ref(false);
const currentTab = ref("table");

onMounted(async () => {
  console.log("App mounted");

  // Проверяем авторизацию (для прав редактирования)
  await authStore.checkAuth();

  // 👇 ВСЕГДА загружаем данные для просмотра
  console.log("Загружаем данные для всех...");
  await dataStore.loadAllData();
  console.log("Данные загружены");
});

const handleLogin = async () => {
  console.log("Пользователь вошел:", authStore.user);
  // При входе данные уже есть, но можно обновить если нужно
  // await dataStore.loadAllData(true); // принудительно
};

const logout = () => {
  authStore.logout();

  // 👇 НЕ очищаем данные при выходе - гость тоже должен видеть
  // dataStore.forestries.value = [];
  // dataStore.sections.value = [];
  // dataStore.indicators.value = [];
  // dataStore.rawData.value = [];

  // 👇 переключаем на безопасную вкладку
  currentTab.value = "table";

  console.log("Выход выполнен, переключено на таблицу данных");
};

const getRoleName = (role) => {
  const roles = {
    admin: "Администратор",
    engineer: "Инженер",
    viewer: "Наблюдатель",
  };
  return roles[role] || role;
};

// Для отладки в консоли
onMounted(() => {
  window.debugStore = dataStore;
});
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
}

header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
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
  background: white;
  padding: 10px 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tabs button:hover {
  color: #333;
}

.tabs button.active {
  color: #4caf50;
  border-bottom-color: #4caf50;
}

.content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Стили для StatsView будут в самом компоненте */
</style>
