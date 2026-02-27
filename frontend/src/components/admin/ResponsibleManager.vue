<template>
  <div class="responsible-manager">
    <h4>👥 Ответственные за показатель</h4>

    <div class="current-responsible">
      <div v-if="responsible.length === 0" class="no-data">
        Нет назначенных ответственных
      </div>
      <div v-else>
        <div
          v-for="user in responsible"
          :key="user.id"
          class="responsible-item"
        >
          <span>{{ user.email }}</span>
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
    responsible.value = respData || [];
    engineers.value = engData || [];
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
};

const availableEngineers = computed(() => {
  const responsibleIds = responsible.value.map((r) => r.user_id);
  return engineers.value.filter((e) => !responsibleIds.includes(e.id));
});

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

.responsible-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 5px;
}

.responsible-item span {
  font-size: 14px;
  color: #333;
}

.btn-remove {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
}

.btn-remove:hover {
  color: #f44336;
}

.add-responsible {
  display: flex;
  gap: 10px;
}

.user-select {
  flex: 1;
  padding: 8px;
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
}

.btn-add:hover:not(:disabled) {
  background: #45a049;
}

.btn-add:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
