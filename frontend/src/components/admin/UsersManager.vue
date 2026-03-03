<template>
  <div class="users-manager">
    <div class="manager-header">
      <h3>👥 Управление пользователями</h3>
      <button @click="openForm()" class="btn-add">+ Новый пользователь</button>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filterRole" class="filter-select">
        <option value="all">Все роли</option>
        <option value="admin">👑 Администраторы</option>
        <option value="engineer">👷 Инженеры</option>
        <option value="viewer">👀 Наблюдатели</option>
      </select>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Поиск по email..."
        class="search-input"
      />
    </div>

    <!-- Список пользователей -->
    <div class="users-list">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card">
        <div class="user-info">
          <div class="user-header">
            <h4>{{ user.email }}</h4>
            <span class="role-badge" :class="user.role">
              {{ getRoleName(user.role) }}
            </span>
          </div>

          <div class="user-details" v-if="user.role === 'engineer'">
            <strong>Лесничества:</strong>
            <div class="forestry-tags">
              <span
                v-for="id in user.forestry_ids"
                :key="id"
                class="forestry-tag"
              >
                {{ getForestryName(id) }}
              </span>
              <span v-if="!user.forestry_ids?.length" class="no-data">
                не назначены
              </span>
            </div>
          </div>

          <div class="user-meta">
            <span class="badge">ID: {{ user.id }}</span>
            <span class="badge">Создан: {{ formatDate(user.created_at) }}</span>
          </div>
        </div>

        <div class="user-actions">
          <button
            @click="openForm(user)"
            class="btn-edit"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            @click="deleteUser(user.id)"
            class="btn-delete"
            title="Удалить"
            :disabled="user.email === 'admin@les.ru'"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для формы -->
    <Modal v-if="showForm" @close="closeForm">
      <UserForm :user="editingUser" @save="saveUser" @cancel="closeForm" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "../../lib/supabase"; // ← ИЗМЕНИТЬ!
import Modal from "../UI/Modal.vue";
import UserForm from "./UserForm.vue";

const users = ref([]);
const forestries = ref([]);
const showForm = ref(false);
const editingUser = ref(null);
const filterRole = ref("all");
const searchQuery = ref("");

const emit = defineEmits(["changed"]);

onMounted(() => {
  loadData();
});

const loadData = async () => {
  try {
    // Загружаем пользователей
    const usersData = await api.getUsers();
    users.value = usersData || [];

    // Загружаем лесничества
    const forestriesData = await api.getForestries();
    forestries.value = forestriesData || [];
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
};

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    // Фильтр по роли
    if (filterRole.value !== "all" && user.role !== filterRole.value)
      return false;

    // Поиск по email
    if (
      searchQuery.value &&
      !user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
      return false;

    return true;
  });
});

const getRoleName = (role) => {
  const roles = {
    admin: "Администратор",
    engineer: "Инженер",
    viewer: "Наблюдатель",
  };
  return roles[role] || role;
};

const getForestryName = (id) => {
  const forestry = forestries.value.find((f) => f.id === id);
  return forestry?.name || "Неизвестно";
};

const openForm = (user = null) => {
  editingUser.value = user;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingUser.value = null;
};

const saveUser = async (userData) => {
  try {
    if (editingUser.value) {
      // Обновление существующего
      await api.updateUser(editingUser.value.id, userData);
    } else {
      // Создание нового
      await api.createUser(userData);
    }
    closeForm();
    loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    alert("Ошибка при сохранении пользователя");
  }
};

const deleteUser = async (id) => {
  const user = users.value.find((u) => u.id === id);
  if (user?.email === "admin@les.ru") {
    alert("Нельзя удалить главного администратора");
    return;
  }

  if (!confirm("Удалить пользователя?")) return;

  try {
    await api.deleteUser(id);
    loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert("Ошибка при удалении пользователя");
  }
};

const formatDate = (date) => {
  if (!date) return "неизвестно";
  return new Date(date).toLocaleDateString("ru-RU");
};
</script>

<style scoped>
.users-manager {
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.manager-header h3 {
  margin: 0;
  color: #333;
}

.btn-add {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover {
  background: #45a049;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-select,
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.filter-select {
  min-width: 200px;
}

.search-input {
  flex: 1;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.user-card:hover {
  background: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: #ffebee;
  color: #c62828;
}

.role-badge.engineer {
  background: #e8f5e9;
  color: #2e7d32;
}

.role-badge.viewer {
  background: #e3f2fd;
  color: #1565c0;
}

.user-details {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.forestry-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.forestry-tag {
  padding: 2px 8px;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
}

.no-data {
  font-style: italic;
  color: #999;
  font-size: 12px;
}

.user-meta {
  display: flex;
  gap: 10px;
}

.badge {
  padding: 4px 8px;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
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

.btn-delete:hover:not(:disabled) {
  background: #d32f2f;
}

.btn-delete:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
