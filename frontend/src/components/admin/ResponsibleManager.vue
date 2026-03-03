<template>
  <div class="responsible-manager">
    <h4>👥 Ответственные за показатель</h4>

    <div class="current-responsible">
      <div v-if="responsible.length === 0" class="no-data">
        Нет назначенных ответственных
      </div>
      <div v-else class="responsible-list">
        <div
          v-for="user in responsible"
          :key="user.id"
          class="responsible-item"
        >
          <div class="user-info">
            <span class="user-email">{{ user.user_email || user.email }}</span>
            <span class="user-role" :class="user.role">{{
              getRoleName(user.role)
            }}</span>
          </div>
          <button
            @click="removeResponsible(user)"
            class="btn-remove"
            title="Удалить"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div class="add-responsible">
      <select v-model="selectedUser" class="user-select">
        <option value="">Выберите инженера...</option>
        <option
          v-for="user in availableEngineers"
          :key="user.id"
          :value="user.id"
        >
          {{ user.email }}
        </option>
      </select>
      <button @click="addResponsible" class="btn-add" :disabled="!selectedUser">
        Добавить
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { api } from "../../lib/supabase"; // ← ИЗМЕНИТЬ!

const props = defineProps({
  indicatorId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["changed"]);

const responsible = ref([]);
const engineers = ref([]);
const selectedUser = ref("");
const loading = ref(false);

// Очищаем все данные
const clearAllData = () => {
  responsible.value = [];
  engineers.value = [];
  selectedUser.value = "";
};

// Загружаем данные
const loadData = async () => {
  if (!props.indicatorId) {
    clearAllData();
    return;
  }

  loading.value = true;
  try {
    const [respData, engData] = await Promise.all([
      api.getIndicatorResponsible(props.indicatorId),
      api.getEngineers(),
    ]);

    // Преобразуем данные в единый формат
    const formattedResponsible = (respData || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      email: item.user_email || item.email,
      role: item.role,
      indicator_id: item.indicator_id,
    }));

    responsible.value = formattedResponsible;
    engineers.value = engData || [];
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    clearAllData();
  } finally {
    loading.value = false;
  }
};

// Следим за изменением ID
watch(
  () => props.indicatorId,
  (newId, oldId) => {
    clearAllData();
    if (newId) {
      loadData();
    }
  },
  { immediate: true },
);

const availableEngineers = computed(() => {
  const responsibleIds = responsible.value.map((r) => r.user_id);
  return engineers.value.filter((e) => !responsibleIds.includes(e.id));
});

const getRoleName = (role) => {
  const roles = {
    admin: "Админ",
    engineer: "Инженер",
    viewer: "Наблюдатель",
  };
  return roles[role] || role;
};

const addResponsible = async () => {
  if (!selectedUser.value) return;
  if (!props.indicatorId) {
    alert("Сначала сохраните показатель");
    return;
  }

  try {
    await api.addResponsible(props.indicatorId, selectedUser.value);
    selectedUser.value = "";
    await loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка добавления:", error);
    alert("Не удалось добавить ответственного");
  }
};

const removeResponsible = async (user) => {
  if (!confirm(`Убрать ответственного ${user.email}?`)) return;

  try {
    await api.removeResponsible(props.indicatorId, user.user_id);
    await loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert("Не удалось удалить ответственного");
  }
};

onMounted(() => {
  if (props.indicatorId) {
    loadData();
  } else {
    clearAllData();
  }
});
</script>

<style scoped>
.responsible-manager {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.responsible-manager h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.current-responsible {
  margin-bottom: 15px;
  min-height: 60px;
  max-height: 300px;
  overflow-y: auto;
}

.no-data {
  color: #999;
  font-style: italic;
  padding: 15px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
}

.responsible-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.responsible-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.responsible-item:hover {
  background: #f0f0f0;
  border-color: #bbb;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.user-email {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.user-role {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
  font-weight: 500;
}

.user-role.engineer {
  background: #e8f5e9;
  color: #2e7d32;
}

.user-role.admin {
  background: #ffebee;
  color: #c62828;
}

.user-role.viewer {
  background: #e3f2fd;
  color: #1565c0;
}

.btn-remove {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  transition: color 0.2s;
  font-weight: bold;
}

.btn-remove:hover {
  color: #f44336;
}

.add-responsible {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.user-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.btn-add {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
  font-weight: 500;
}

.btn-add:hover:not(:disabled) {
  background: #45a049;
}

.btn-add:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
