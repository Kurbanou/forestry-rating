<template>
  <div class="admin-panel">
    <h2>Панель управления</h2>

    <div class="admin-tabs">
      <button
        @click="adminTab = 'sections'"
        :class="{ active: adminTab === 'sections' }"
      >
        📁 Разделы
      </button>
      <button
        @click="adminTab = 'indicators'"
        :class="{ active: adminTab === 'indicators' }"
      >
        📊 Показатели
      </button>
      <button
        @click="adminTab = 'users'"
        :class="{ active: adminTab === 'users' }"
      >
        👥 Пользователи
      </button>
    </div>

    <!-- Управление разделами -->
    <div v-if="adminTab === 'sections'" class="tab-content">
      <div class="section-header">
        <h3>Разделы</h3>
        <button @click="showSectionForm = true" class="btn-add">
          + Новый раздел
        </button>
      </div>

      <div class="sections-list">
        <div v-for="section in sections" :key="section.id" class="section-item">
          <div class="section-info">
            <strong>{{ section.name }}</strong>
            <p>{{ section.description }}</p>
          </div>
          <div class="section-actions">
            <button @click="editSection(section)" class="btn-edit">✏️</button>
            <button @click="deleteSection(section.id)" class="btn-delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Управление показателями -->
    <div v-if="adminTab === 'indicators'" class="tab-content">
      <div class="section-header">
        <h3>Показатели</h3>
        <button @click="showIndicatorForm = true" class="btn-add">
          + Новый показатель
        </button>
      </div>

      <div class="indicators-list">
        <div
          v-for="indicator in indicators"
          :key="indicator.id"
          class="indicator-item"
        >
          <div class="indicator-info">
            <strong>{{ indicator.name }}</strong>
            <span class="badge">макс. {{ indicator.max_weight }} баллов</span>
            <span class="unit">{{ indicator.unit }}</span>
            <p>{{ indicator.description }}</p>
            <small>Раздел: {{ getSectionName(indicator.section_id) }}</small>
          </div>
          <div class="indicator-actions">
            <button @click="editIndicator(indicator)" class="btn-edit">
              ✏️
            </button>
            <button @click="deleteIndicator(indicator.id)" class="btn-delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Управление пользователями -->
    <div v-if="adminTab === 'users'" class="tab-content">
      <div class="section-header">
        <h3>Пользователи</h3>
        <button @click="showUserForm = true" class="btn-add">
          + Новый пользователь
        </button>
      </div>

      <div class="users-list">
        <div v-for="user in users" :key="user.id" class="user-item">
          <div class="user-info">
            <strong>{{ user.email }}</strong>
            <span class="role-badge" :class="user.role">
              {{ getRoleName(user.role) }}
            </span>
          </div>
          <div class="user-actions">
            <button @click="editUser(user)" class="btn-edit">✏️</button>
            <button @click="deleteUser(user.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальные окна для форм (создадим позже) -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useDataStore } from "../stores/dataStore";

const dataStore = useDataStore();
const adminTab = ref("sections");

// Данные из store
const sections = ref([]);
const indicators = ref([]);
const users = ref([]);

// Состояние форм
const showSectionForm = ref(false);
const showIndicatorForm = ref(false);
const showUserForm = ref(false);

// Загрузка данных
onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  // TODO: Загрузить данные с сервера
  // Пока заглушки
  sections.value = dataStore.sections;
  indicators.value = dataStore.indicators;
  users.value = [
    { id: 1, email: "admin@example.com", role: "admin" },
    { id: 2, email: "engineer@example.com", role: "engineer" },
  ];
};

const getSectionName = (sectionId) => {
  const section = sections.value.find((s) => s.id === sectionId);
  return section?.name || "Без раздела";
};

const getRoleName = (role) => {
  const roles = {
    admin: "Администратор",
    engineer: "Инженер",
    viewer: "Наблюдатель",
  };
  return roles[role] || role;
};

// Заглушки для действий
const editSection = (section) => {
  // console.log("Редактирование раздела:", section);
  showSectionForm.value = true;
};

const deleteSection = (id) => {
  if (confirm("Удалить раздел?")) {
    // console.log("Удаление раздела:", id);
  }
};

const editIndicator = (indicator) => {
  // console.log("Редактирование показателя:", indicator);
  showIndicatorForm.value = true;
};

const deleteIndicator = (id) => {
  if (confirm("Удалить показатель?")) {
    // console.log("Удаление показателя:", id);
  }
};

const editUser = (user) => {
  // console.log("Редактирование пользователя:", user);
  showUserForm.value = true;
};

const deleteUser = (id) => {
  if (confirm("Удалить пользователя?")) {
    // console.log("Удаление пользователя:", id);
  }
};
</script>

<style scoped>
.admin-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-panel h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.admin-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.admin-tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-radius: 4px;
}

.admin-tabs button:hover {
  background: #f5f5f5;
}

.admin-tabs button.active {
  background: #4caf50;
  color: white;
}

.tab-content {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.btn-add {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add:hover {
  background: #45a049;
}

.sections-list,
.indicators-list,
.users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-item,
.indicator-item,
.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f9f9f9;
}

.section-info,
.indicator-info,
.user-info {
  flex: 1;
}

.section-info strong,
.indicator-info strong,
.user-info strong {
  font-size: 16px;
  color: #333;
}

.section-info p,
.indicator-info p {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #666;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
}

.unit {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 10px;
}

.role-badge.admin {
  background: #ffebee;
  color: #c62828;
}

.role-badge.engineer {
  background: #e8f5e8;
  color: #2e7d32;
}

.role-badge.viewer {
  background: #e3f2fd;
  color: #1565c0;
}

.section-actions,
.indicator-actions,
.user-actions {
  display: flex;
  gap: 5px;
}

.btn-edit,
.btn-delete {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}
</style>
