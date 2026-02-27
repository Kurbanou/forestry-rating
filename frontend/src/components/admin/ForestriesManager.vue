<template>
  <div class="forestries-manager">
    <div class="manager-header">
      <h3>🌳 Управление лесничествами</h3>
      <button @click="openForm()" class="btn-add">+ Новое лесничество</button>
    </div>

    <!-- Поиск -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Поиск по названию..."
        class="search-input"
      />
    </div>

    <!-- Список лесничеств -->
    <div class="forestries-list">
      <div
        v-for="forestry in filteredForestries"
        :key="forestry.id"
        class="forestry-card"
      >
        <div class="forestry-info">
          <h4>{{ forestry.name }}</h4>
          <div class="forestry-meta">
            <span class="badge">ID: {{ forestry.id }}</span>
            <span class="badge"
              >Создан: {{ formatDate(forestry.created_at) }}</span
            >
          </div>
        </div>

        <div class="forestry-actions">
          <button
            @click="openForm(forestry)"
            class="btn-edit"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            @click="deleteForestry(forestry.id)"
            class="btn-delete"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для формы -->
    <Modal v-if="showForm" @close="closeForm">
      <ForestryForm
        :forestry="editingForestry"
        @save="saveForestry"
        @cancel="closeForm"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "../../lib/api";
import Modal from "../UI/Modal.vue";
import ForestryForm from "./ForestryForm.vue";

const forestries = ref([]);
const showForm = ref(false);
const editingForestry = ref(null);
const searchQuery = ref("");

const emit = defineEmits(["changed"]);

onMounted(() => {
  loadForestries();
});

const loadForestries = async () => {
  try {
    forestries.value = await api.getForestries();
  } catch (error) {
    console.error("Ошибка загрузки лесничеств:", error);
  }
};

const filteredForestries = computed(() => {
  if (!searchQuery.value) return forestries.value;

  return forestries.value.filter((forestry) =>
    forestry.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const openForm = (forestry = null) => {
  editingForestry.value = forestry;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingForestry.value = null;
};

const saveForestry = async (forestryData) => {
  try {
    if (editingForestry.value) {
      // Обновление существующего
      await api.updateForestry(editingForestry.value.id, forestryData);
    } else {
      // Создание нового
      await api.createForestry(forestryData);
    }
    closeForm();
    loadForestries();
    emit("changed");
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    alert("Ошибка при сохранении лесничества");
  }
};

const deleteForestry = async (id) => {
  if (!confirm("Удалить лесничество? Все данные по нему тоже будут удалены."))
    return;

  try {
    await api.deleteForestry(id);
    loadForestries();
    emit("changed");
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert("Ошибка при удалении лесничества");
  }
};

const formatDate = (date) => {
  if (!date) return "неизвестно";
  return new Date(date).toLocaleDateString("ru-RU");
};
</script>

<style scoped>
.forestries-manager {
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
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.forestries-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.forestry-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.forestry-card:hover {
  background: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.forestry-info h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.forestry-meta {
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

.forestry-actions {
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

.btn-delete:hover {
  background: #d32f2f;
}
</style>
