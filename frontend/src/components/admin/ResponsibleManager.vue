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
            <span class="user-email">{{ user.user_email }}</span>
            <span class="user-role" :class="user.role">{{
              getRoleName(user.role)
            }}</span>
          </div>
          <button
            @click="removeResponsible(user.user_id)"
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
import { ref, computed, onMounted } from "vue";
import { api } from "../../lib/api";

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

onMounted(() => {
  loadData();
});

const loadData = async () => {
  try {
    const [respData, engData] = await Promise.all([
      api.getIndicatorResponsible(props.indicatorId),
      api.getEngineers(),
    ]);
    console.log("respData:", respData); // ← ПОСМОТРИТЕ ЭТО
    responsible.value = respData || [];
    engineers.value = engData || [];
    console.log("Ответственные:", responsible.value); // Для отладки
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
};

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

const removeResponsible = async (userId) => {
  if (!confirm("Убрать ответственного?")) return;

  try {
    await api.removeResponsible(props.indicatorId, userId);
    await loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert("Не удалось удалить ответственного");
  }
};
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
}

.current-responsible {
  margin-bottom: 15px;
  min-height: 60px;
}

.no-data {
  color: #999;
  font-style: italic;
  padding: 10px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 4px;
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
  padding: 10px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.responsible-item:hover {
  background: #f5f5f5;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
}

.btn-add:hover:not(:disabled) {
  background: #45a049;
}

.btn-add:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
