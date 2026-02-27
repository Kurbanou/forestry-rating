<template>
  <div class="indicators-manager">
    <div class="manager-header">
      <h3>📊 Управление показателями</h3>
      <button @click="openForm()" class="btn-add">+ Новый показатель</button>
    </div>

    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filterSection" class="filter-select">
        <option value="all">Все разделы</option>
        <option
          v-for="section in sections"
          :key="section.id"
          :value="section.id"
        >
          {{ section.name }}
        </option>
      </select>

      <select v-model="filterType" class="filter-select">
        <option value="all">Все типы</option>
        <option value="positive">📊 Обычные</option>
        <option value="penalty">⚠️ Штрафные</option>
        <option value="bonus">🎁 Бонусные</option>
      </select>
    </div>

    <!-- Список показателей -->
    <div class="indicators-list">
      <div
        v-for="indicator in filteredIndicators"
        :key="indicator.id"
        class="indicator-card"
        :class="indicator.type"
      >
        <div class="indicator-info">
          <div class="indicator-header">
            <h4>{{ indicator.name }}</h4>
            <span class="type-badge" :class="indicator.type">
              {{ getTypeLabel(indicator.type) }}
            </span>
          </div>

          <div class="indicator-details">
            <span class="detail">
              <strong>Раздел:</strong>
              {{ getSectionName(indicator.section_id) }}
            </span>
            <span class="detail">
              <strong>Макс. балл:</strong> {{ indicator.max_weight }}
            </span>
            <span class="detail">
              <strong>Ед. изм.:</strong> {{ indicator.unit }}
            </span>
          </div>

          <p class="indicator-desc">{{ indicator.description }}</p>

          <div class="indicator-meta">
            <span class="badge">ID: {{ indicator.id }}</span>
            <span class="badge"
              >Создан: {{ formatDate(indicator.created_at) }}</span
            >
          </div>
        </div>

        <div class="indicator-actions">
          <button
            @click="openForm(indicator)"
            class="btn-edit"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            @click="deleteIndicator(indicator.id)"
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
      <IndicatorForm
        :indicator="editingIndicator"
        :sections="sections"
        @save="saveIndicator"
        @cancel="closeForm"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "../../lib/api"; // ← ИСПОЛЬЗУЕМ API, НЕ SUPABASE
import Modal from "../UI/Modal.vue";
import IndicatorForm from "./IndicatorForm.vue";

const indicators = ref([]);
const sections = ref([]);
const showForm = ref(false);
const editingIndicator = ref(null);
const filterSection = ref("all");
const filterType = ref("all");

const emit = defineEmits(["changed"]);

onMounted(() => {
  loadData();
});

const loadData = async () => {
  try {
    // Загружаем показатели через наш API
    const indicatorsData = await api.getIndicators();
    indicators.value = indicatorsData || [];

    // Загружаем разделы через наш API
    const sectionsData = await api.getSections();
    sections.value = sectionsData || [];
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
};

const filteredIndicators = computed(() => {
  return indicators.value.filter((indicator) => {
    if (
      filterSection.value !== "all" &&
      indicator.section_id !== filterSection.value
    )
      return false;
    if (filterType.value !== "all" && indicator.type !== filterType.value)
      return false;
    return true;
  });
});

const getSectionName = (sectionId) => {
  const section = sections.value.find((s) => s.id === sectionId);
  return section?.name || "Без раздела";
};

const getTypeLabel = (type) => {
  const labels = {
    positive: "📊 Обычный",
    penalty: "⚠️ Штрафной",
    bonus: "🎁 Бонусный",
  };
  return labels[type] || type;
};

const openForm = (indicator = null) => {
  editingIndicator.value = indicator;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingIndicator.value = null;
};

const saveIndicator = async (indicatorData) => {
  try {
    if (editingIndicator.value) {
      // Обновление существующего
      await api.updateIndicator(editingIndicator.value.id, indicatorData);
    } else {
      // Создание нового
      await api.createIndicator(indicatorData);
    }
    closeForm();
    loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    alert("Ошибка при сохранении показателя");
  }
};

const deleteIndicator = async (id) => {
  if (!confirm("Удалить показатель?")) return;

  try {
    await api.deleteIndicator(id);
    loadData();
    emit("changed");
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert("Ошибка при удалении показателя");
  }
};

const formatDate = (date) => {
  if (!date) return "неизвестно";
  return new Date(date).toLocaleDateString("ru-RU");
};
</script>

<style scoped>
.indicators-manager {
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

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.indicators-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.indicator-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.indicator-card.positive {
  border-left: 4px solid #4caf50;
}

.indicator-card.penalty {
  border-left: 4px solid #f44336;
}

.indicator-card.bonus {
  border-left: 4px solid #ffc107;
}

.indicator-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.indicator-header h4 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.positive {
  background: #e8f5e9;
  color: #2e7d32;
}

.type-badge.penalty {
  background: #ffebee;
  color: #c62828;
}

.type-badge.bonus {
  background: #fff8e1;
  color: #ff8f00;
}

.indicator-details {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.indicator-desc {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.indicator-meta {
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

.indicator-actions {
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
