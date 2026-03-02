<template>
  <div class="rating-table">
    <div class="table-header">
      <h2>Данные за {{ formatPeriod(currentPeriod) }}</h2>
      <div class="period-controls">
        <input
          type="month"
          :value="currentPeriod"
          @change="changePeriod"
          class="period-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>

    <div v-else class="sections">
      <!-- Обычные показатели (с расчетом по формуле) -->
      <div v-for="section in sections" :key="section.id" class="section">
        <h3>{{ section.name }}</h3>
        <p class="section-desc">{{ section.description }}</p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="forestry-col">Лесничество</th>
                <th
                  v-for="indicator in getRegularIndicators(section.id)"
                  :key="indicator.id"
                  class="indicator-col"
                >
                  <div class="indicator-header">
                    <span>{{ indicator.name }}</span>
                    <span class="indicator-type regular">📊 Обычный</span>
                    <span class="max-weight"
                      >макс. {{ indicator.max_weight }} баллов</span
                    >
                    <span class="unit">{{ indicator.unit }}</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="forestry in forestries" :key="forestry.id">
                <td class="forestry-name">{{ forestry.name }}</td>

                <td
                  v-for="indicator in getRegularIndicators(section.id)"
                  :key="indicator.id"
                  class="data-cell"
                  :class="{
                    editable: canEditIndicator(indicator.id),
                    editing: isEditing(forestry.id, indicator.id),
                  }"
                >
                  <div class="cell-content">
                    <template v-if="canEditIndicator(indicator.id)">
                      <input
                        type="number"
                        :value="getInputValue(forestry.id, indicator.id)"
                        @focus="startEditing(forestry.id, indicator.id, $event)"
                        @input="
                          updateEditingValue(forestry.id, indicator.id, $event)
                        "
                        @blur="saveEditing(forestry.id, indicator.id, $event)"
                        @keyup.enter="
                          saveEditing(forestry.id, indicator.id, $event)
                        "
                        @keyup.escape="
                          cancelEditing(forestry.id, indicator.id, $event)
                        "
                        :placeholder="indicator.unit"
                        min="-300"
                        step="10"
                        class="value-input"
                        :ref="
                          (el) => setInputRef(el, forestry.id, indicator.id)
                        "
                      />
                    </template>
                    <span v-else class="readonly-value">
                      {{ getValue(forestry.id, indicator.id) }}
                      {{ indicator.unit }}
                    </span>
                    <span class="score-badge positive">
                      +{{ getScore(forestry.id, indicator.id) }} баллов
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Отдельный раздел для штрафных показателей -->
      <div v-if="penaltyIndicators.length > 0" class="section penalty-section">
        <h3>⚠️ Штрафные показатели</h3>
        <p class="section-desc">
          Введите количество штрафных баллов (отрицательные числа)
        </p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="forestry-col">Лесничество</th>
                <th
                  v-for="indicator in penaltyIndicators"
                  :key="indicator.id"
                  class="indicator-col penalty-header"
                >
                  <div class="indicator-header">
                    <span>{{ indicator.name }}</span>
                    <span class="indicator-type penalty">⚠️ Штрафной</span>
                    <span class="max-weight"
                      >макс. {{ indicator.max_weight }} баллов</span
                    >
                    <span class="unit">баллы</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="forestry in forestries" :key="forestry.id">
                <td class="forestry-name">{{ forestry.name }}</td>

                <td
                  v-for="indicator in penaltyIndicators"
                  :key="indicator.id"
                  class="data-cell penalty-cell"
                  :class="{
                    editable: canEditIndicator(indicator.id),
                    editing: isEditing(forestry.id, indicator.id),
                  }"
                >
                  <div class="cell-content">
                    <template v-if="canEditIndicator(indicator.id)">
                      <input
                        type="number"
                        :value="getInputValue(forestry.id, indicator.id)"
                        @focus="startEditing(forestry.id, indicator.id, $event)"
                        @input="
                          updateEditingValue(forestry.id, indicator.id, $event)
                        "
                        @blur="saveEditing(forestry.id, indicator.id, $event)"
                        @keyup.enter="
                          saveEditing(forestry.id, indicator.id, $event)
                        "
                        @keyup.escape="
                          cancelEditing(forestry.id, indicator.id, $event)
                        "
                        placeholder="баллы"
                        :min="-indicator.max_weight"
                        max="0"
                        step="1"
                        class="value-input penalty-input"
                        :ref="
                          (el) => setInputRef(el, forestry.id, indicator.id)
                        "
                      />
                      <small class="input-hint">
                        Введите отрицательное число (например: -50)
                      </small>
                    </template>
                    <span v-else class="readonly-value penalty-value">
                      {{ getValue(forestry.id, indicator.id) }} баллов
                    </span>
                    <span class="score-badge penalty">
                      {{ getValue(forestry.id, indicator.id) }} баллов
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Итоговая таблица -->
    <div class="total-section">
      <h3>📊 Итоговые баллы по лесничествам</h3>
      <table class="total-table">
        <thead>
          <tr>
            <th>Лесничество</th>
            <th>Обычные показатели</th>
            <th v-for="indicator in penaltyIndicators" :key="indicator.id">
              {{ indicator.name }}
            </th>
            <th>ИТОГО</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="forestry in forestries" :key="forestry.id">
            <td class="forestry-name">{{ forestry.name }}</td>
            <td class="positive">+{{ getRegularTotal(forestry.id) }}</td>
            <td
              v-for="indicator in penaltyIndicators"
              :key="indicator.id"
              class="penalty"
            >
              {{ getValue(forestry.id, indicator.id) }}
            </td>
            <td class="total-cell" :class="getTotalClass(forestry.id)">
              <strong>{{ getTotalScore(forestry.id) }}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useDataStore } from "../stores/dataStore";
import { useAuthStore } from "../stores/authStore";

const dataStore = useDataStore();
const authStore = useAuthStore();

// Состояние для редактирования
const editingCell = ref(null);
const editingValues = ref(new Map());
const inputRefs = ref(new Map());

// Computed свойства
const forestries = computed(() => dataStore.forestries);
const sections = computed(() => dataStore.sections);
const indicators = computed(() => dataStore.indicators);
const loading = computed(() => dataStore.loading);
const currentPeriod = computed(() => dataStore.currentPeriod);

// Разделяем показатели
const regularIndicators = computed(() =>
  indicators.value.filter((i) => i.type !== "penalty"),
);

const penaltyIndicators = computed(() =>
  indicators.value.filter((i) => i.type === "penalty"),
);

// Получение обычных показателей по разделу
const getRegularIndicators = (sectionId) => {
  return regularIndicators.value.filter((i) => i.section_id === sectionId);
};

// Загрузка данных
onMounted(() => {
  if (authStore.isAuthenticated) {
    dataStore.loadAllData();
  }
  window.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
});

// Проверка прав на редактирование
const canEditIndicator = (indicatorId) => {
  // Админ может всё
  if (authStore.user?.role === "admin") return true;

  // Инженер может редактировать только назначенные показатели
  if (authStore.user?.role === "engineer") {
    return dataStore.isUserResponsibleForIndicator(
      authStore.user.id,
      indicatorId,
    );
  }

  // Наблюдатели и гости не могут редактировать
  return false;
};

// Получение значений
const getValue = (forestryId, indicatorId) => {
  return dataStore.getValue(forestryId, indicatorId);
};

const getScore = (forestryId, indicatorId) => {
  const indicator = indicators.value.find((i) => i.id === indicatorId);
  if (indicator?.type === "penalty") {
    // Для штрафов возвращаем как есть (отрицательное число)
    return getValue(forestryId, indicatorId);
  } else {
    // Для обычных - расчет
    return dataStore.getScore(forestryId, indicatorId);
  }
};

// Сумма обычных показателей
const getRegularTotal = (forestryId) => {
  let total = 0;
  regularIndicators.value.forEach((indicator) => {
    total += dataStore.getScore(forestryId, indicator.id);
  });
  return total.toFixed(2);
};

// Итоговая сумма (обычные + штрафы)
const getTotalScore = (forestryId) => {
  let total = 0;

  // Плюсуем обычные
  regularIndicators.value.forEach((indicator) => {
    total += dataStore.getScore(forestryId, indicator.id);
  });

  // Плюсуем штрафы (они уже отрицательные)
  penaltyIndicators.value.forEach((indicator) => {
    total += getValue(forestryId, indicator.id);
  });

  return total.toFixed(2);
};

// Класс для итога
const getTotalClass = (forestryId) => {
  const total = parseFloat(getTotalScore(forestryId));
  if (total > 0) return "positive";
  if (total < 0) return "penalty";
  return "neutral";
};

// Редактирование
const isEditing = (forestryId, indicatorId) => {
  return (
    editingCell.value?.forestryId === forestryId &&
    editingCell.value?.indicatorId === indicatorId
  );
};

const getInputValue = (forestryId, indicatorId) => {
  const key = `${forestryId}-${indicatorId}`;
  if (editingValues.value.has(key)) {
    return editingValues.value.get(key);
  }
  return getValue(forestryId, indicatorId);
};

const startEditing = async (forestryId, indicatorId, event) => {
  const key = `${forestryId}-${indicatorId}`;
  editingValues.value.set(key, getValue(forestryId, indicatorId));
  editingCell.value = { forestryId, indicatorId };
  await nextTick();
  event.target.select();
};

const updateEditingValue = (forestryId, indicatorId, event) => {
  const key = `${forestryId}-${indicatorId}`;
  const value =
    event.target.value === "" ? 0 : parseFloat(event.target.value) || 0;
  editingValues.value.set(key, value);
};

const saveEditing = async (forestryId, indicatorId, event) => {
  const key = `${forestryId}-${indicatorId}`;
  const newValue = editingValues.value.get(key);
  const oldValue = getValue(forestryId, indicatorId);

  editingValues.value.delete(key);
  editingCell.value = null;

  if (newValue !== undefined && newValue !== oldValue) {
    await dataStore.saveValue(forestryId, indicatorId, newValue);
  }
};

const cancelEditing = (forestryId, indicatorId, event) => {
  const key = `${forestryId}-${indicatorId}`;
  editingValues.value.delete(key);
  editingCell.value = null;
  event.target.blur();
};

const handleGlobalKeyDown = (event) => {
  if (event.key === "Escape" && editingCell.value) {
    const { forestryId, indicatorId } = editingCell.value;
    const input = inputRefs.value.get(`${forestryId}-${indicatorId}`);
    if (input) {
      cancelEditing(forestryId, indicatorId, { target: input });
    }
  }
};

const setInputRef = (el, forestryId, indicatorId) => {
  if (el) {
    inputRefs.value.set(`${forestryId}-${indicatorId}`, el);
  }
};

const changePeriod = (event) => {
  dataStore.currentPeriod = event.target.value;
  dataStore.loadAllData();
};

const formatPeriod = (period) => {
  if (!period) return "";
  const [year, month] = period.split("-");
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};
</script>

<style scoped>
.rating-table {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.table-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.period-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.period-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.section {
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.penalty-section {
  border-color: #ffcdd2;
  background: #fff8f8;
}

.penalty-section h3 {
  background: #ffebee;
  color: #c62828;
}

.section h3 {
  margin: 0;
  padding: 15px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-size: 1.2rem;
}

.section-desc {
  margin: 0;
  padding: 10px 15px;
  background: #fafafa;
  font-size: 14px;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #ddd;
}

.penalty-header {
  background: #ffebee;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.forestry-col,
.forestry-name {
  min-width: 150px;
  font-weight: 500;
  background: #fafafa;
  position: sticky;
  left: 0;
}

.forestry-name {
  font-weight: 600;
}

.indicator-header {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.indicator-type {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}

.indicator-type.regular {
  background: #e8f5e9;
  color: #2e7d32;
}

.indicator-type.penalty {
  background: #ffebee;
  color: #c62828;
}

.max-weight {
  font-size: 12px;
  color: #666;
}

.unit {
  font-size: 11px;
  color: #999;
  font-style: italic;
}

.data-cell {
  background: #fff;
}

.data-cell.editable:hover {
  background-color: #f9f9f9;
}

.data-cell.editing {
  background-color: #fff8e7;
}

.penalty-cell {
  background: #fff8f8;
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.value-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.value-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.penalty-input {
  border-color: #ffcdd2;
}

.penalty-input:focus {
  border-color: #f44336;
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
}

.input-hint {
  font-size: 10px;
  color: #f44336;
}

.readonly-value {
  font-size: 14px;
  color: #333;
  padding: 6px 0;
}

.penalty-value {
  color: #c62828;
}

.score-badge {
  font-size: 12px;
  font-weight: 500;
}

.score-badge.positive {
  color: #4caf50;
}

.score-badge.penalty {
  color: #f44336;
}

.total-section {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.total-section h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.total-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.total-table th {
  background: #e0e0e0;
  padding: 10px;
}

.total-table td {
  padding: 10px;
  text-align: center;
  border: 1px solid #eee;
}

.total-table td.positive {
  color: #4caf50;
  font-weight: 500;
}

.total-table td.penalty {
  color: #f44336;
  font-weight: 500;
}

.total-cell {
  font-weight: 700;
  background: #f5f5f5;
}

.total-cell.positive {
  color: #4caf50;
}

.total-cell.penalty {
  color: #f44336;
  background: #ffebee;
}

@media (max-width: 768px) {
  .rating-table {
    padding: 10px;
  }

  .table-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .period-input {
    width: 100%;
  }
}
</style>
