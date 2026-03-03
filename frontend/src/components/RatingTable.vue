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

    <div v-else-if="!forestries.length" class="no-data">
      Нет данных о лесничествах
    </div>

    <div v-else class="sections">
      <!-- Таблица с показателями по строкам, лесничествами по колонкам -->
      <div v-for="section in sections" :key="section.id" class="section">
        <h3>{{ section.name }}</h3>
        <p class="section-desc">{{ section.description }}</p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="indicator-col">Показатель</th>
                <th
                  v-for="forestry in forestries"
                  :key="forestry.id"
                  class="forestry-header"
                >
                  {{ forestry.name }}
                </th>
              </tr>
            </thead>

            <tbody>
              <!-- Строки для всех показателей раздела -->
              <template
                v-for="indicator in getSectionIndicators(section.id)"
                :key="indicator.id"
              >
                <tr class="indicator-row">
                  <td
                    class="indicator-info"
                    :class="{ 'manual-row': indicator.type === 'manual' }"
                  >
                    <div class="indicator-header">
                      <span class="indicator-name">{{ indicator.name }}</span>

                      <!-- Для обычных показываем макс. баллы -->
                      <template v-if="indicator.type !== 'manual'">
                        <span class="max-weight">
                          макс. {{ indicator.max_weight }} баллов
                        </span>
                        <span v-if="indicator.unit" class="unit">
                          ед. изм: {{ indicator.unit }}
                        </span>
                      </template>

                      <!-- Для бонусных просто единицы -->
                      <span v-else class="unit">баллы</span>
                    </div>
                  </td>

                  <!-- Ячейки для каждого лесничества -->
                  <td
                    v-for="forestry in forestries"
                    :key="forestry.id"
                    class="data-cell"
                    :class="{
                      editable: canEditIndicator(indicator.id),
                      editing: isEditing(forestry.id, indicator.id),
                      'manual-cell': indicator.type === 'manual',
                      'positive-value':
                        indicator.type === 'manual' &&
                        getValue(forestry.id, indicator.id) > 0,
                      'negative-value':
                        indicator.type === 'manual' &&
                        getValue(forestry.id, indicator.id) < 0,
                    }"
                  >
                    <div class="cell-content">
                      <template v-if="canEditIndicator(indicator.id)">
                        <input
                          type="number"
                          :value="getInputValue(forestry.id, indicator.id)"
                          @focus="
                            startEditing(forestry.id, indicator.id, $event)
                          "
                          @input="
                            updateEditingValue(
                              forestry.id,
                              indicator.id,
                              $event,
                            )
                          "
                          @blur="saveEditing(forestry.id, indicator.id, $event)"
                          @keyup.enter="
                            saveEditing(forestry.id, indicator.id, $event)
                          "
                          @keyup.escape="
                            cancelEditing(forestry.id, indicator.id, $event)
                          "
                          :placeholder="
                            indicator.type === 'manual'
                              ? '+/-'
                              : indicator.unit || '0'
                          "
                          :min="indicator.type === 'manual' ? undefined : 0"
                          :step="10"
                          class="value-input"
                          :class="{
                            'manual-input': indicator.type === 'manual',
                          }"
                          :ref="
                            (el) => setInputRef(el, forestry.id, indicator.id)
                          "
                        />
                      </template>

                      <!-- Отображение значения -->
                      <span
                        v-else
                        class="readonly-value"
                        :class="{
                          'positive-text':
                            indicator.type === 'manual' &&
                            getValue(forestry.id, indicator.id) > 0,
                          'negative-text':
                            indicator.type === 'manual' &&
                            getValue(forestry.id, indicator.id) < 0,
                        }"
                      >
                        {{ getValue(forestry.id, indicator.id) }}
                      </span>

                      <!-- Баллы (для обычных) -->
                      <span
                        v-if="indicator.type !== 'manual'"
                        class="score-badge positive"
                      >
                        {{ getScore(forestry.id, indicator.id) }} баллов
                      </span>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Итоговая таблица (только итого) -->
    <div class="total-section">
      <h3>📊 Итоговые баллы</h3>
      <div class="table-container">
        <table class="total-table">
          <thead>
            <tr>
              <th>Лесничество</th>
              <th>Итоговый балл</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="forestry in forestries" :key="forestry.id">
              <td class="forestry-name">{{ forestry.name }}</td>
              <td class="total-cell" :class="getTotalClass(forestry.id)">
                <strong>{{ getTotalScore(forestry.id) }}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
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

// Разделяем показатели по типам
const regularIndicators = computed(() =>
  indicators.value.filter((i) => i.type !== "manual"),
);

const manualIndicators = computed(() =>
  indicators.value.filter((i) => i.type === "manual"),
);

// Получение показателей по разделу (всех)
const getSectionIndicators = (sectionId) => {
  return indicators.value.filter((i) => i.section_id === sectionId);
};

// Загрузка данных
onMounted(async () => {
  console.log("RatingTable mounted");
  // Данные уже загружаются в App.vue, но если нужно - можно проверить
  if (!dataStore.forestries.length) {
    await dataStore.loadAllData();
  }
  window.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
});

// Следим за изменением данных для отладки
watch(
  () => dataStore.rawData,
  (newData) => {
    console.log("rawData изменился, записей:", newData.length);
  },
  { deep: true },
);

// Проверка прав на редактирование
const canEditIndicator = (indicatorId) => {
  if (authStore.user?.role === "admin") return true;
  if (authStore.user?.role === "engineer") {
    return dataStore.isUserResponsibleForIndicator(
      authStore.user.id,
      indicatorId,
    );
  }
  return false;
};

// Получение значений
const getValue = (forestryId, indicatorId) => {
  const value = dataStore.getValue(forestryId, indicatorId);
  // console.log(`getValue(${forestryId}, ${indicatorId}) =`, value);
  return value;
};

const getScore = (forestryId, indicatorId) => {
  const score = dataStore.getScore(forestryId, indicatorId);
  // console.log(`getScore(${forestryId}, ${indicatorId}) =`, score);
  return score;
};

// Сумма обычных показателей
const getRegularTotal = (forestryId) => {
  try {
    let total = 0;
    regularIndicators.value.forEach((indicator) => {
      const score = dataStore.getScore(forestryId, indicator.id);
      total += Number(score) || 0;
    });
    return total.toFixed(2);
  } catch (error) {
    console.error("Ошибка расчета обычных показателей:", error);
    return "0.00";
  }
};

// Итоговая сумма (обычные + ручные)
const getTotalScore = (forestryId) => {
  try {
    let total = 0;

    // Обычные показатели
    regularIndicators.value.forEach((indicator) => {
      const score = dataStore.getScore(forestryId, indicator.id);
      total += Number(score) || 0;
    });

    // Ручные (бонус/штраф)
    manualIndicators.value.forEach((indicator) => {
      const value = getValue(forestryId, indicator.id);
      total += Number(value) || 0;
    });

    return total.toFixed(2);
  } catch (error) {
    console.error("Ошибка расчета итога:", error);
    return "0.00";
  }
};

// Класс для итога
const getTotalClass = (forestryId) => {
  try {
    const total = parseFloat(getTotalScore(forestryId));
    if (total > 0) return "positive";
    if (total < 0) return "penalty";
    return "neutral";
  } catch (error) {
    return "neutral";
  }
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
    try {
      await dataStore.saveValue(forestryId, indicatorId, newValue);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
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

const changePeriod = async (event) => {
  const newPeriod = event.target.value;
  console.log("Смена периода на:", newPeriod);

  // НЕ перезагружаем все данные, только меняем период в store
  dataStore.setPeriod(newPeriod);

  // Не вызываем loadAllData!
  // await dataStore.loadAllData(true);

  console.log("Период изменен");
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

.indicator-col {
  min-width: 250px;
  position: sticky;
  left: 0;
  background: #f5f5f5;
  z-index: 2;
}

.forestry-header {
  min-width: 120px;
  text-align: center;
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
}

.indicator-row {
  border-bottom: 1px solid #eee;
}

.indicator-row:hover {
  background-color: #f9f9f9;
}

.indicator-info {
  padding: 15px;
  position: sticky;
  left: 0;
  background: white;
  z-index: 1;
  border-right: 1px solid #ddd;
}

.indicator-info.manual-row {
  background: #fffaf2;
}

.indicator-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.indicator-name {
  font-weight: 600;
  font-size: 14px;
}

.max-weight {
  font-size: 11px;
  color: #666;
}

.unit {
  font-size: 11px;
  color: #999;
  font-style: italic;
}

.data-cell {
  padding: 10px;
  text-align: center;
  background: white;
}

.data-cell.editable:hover {
  background-color: #f0f7ff;
  cursor: pointer;
}

.data-cell.editing {
  background-color: #fff8e7;
  padding: 5px;
}

.manual-cell {
  background-color: #fffaf2;
}

.positive-value {
  background-color: rgba(76, 175, 80, 0.05);
}

.negative-value {
  background-color: rgba(244, 67, 54, 0.05);
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-height: 60px;
}

.value-input {
  width: 100px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.value-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.manual-input {
  border-color: #ffb74d;
}

.manual-input:focus {
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.1);
}

.readonly-value {
  font-size: 16px;
  font-weight: 500;
  padding: 6px 0;
}

.positive-text {
  color: #2e7d32;
}

.negative-text {
  color: #c62828;
}

.score-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #e8f5e9;
  color: #2e7d32;
  white-space: nowrap;
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
  text-align: center;
}

.total-table {
  width: 100%;
  max-width: 500px;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.total-table th {
  background: #e0e0e0;
  padding: 12px;
  /* text-align: center; */
  font-size: 1em;
  color: black;
}

.total-table td {
  color: #667;
  padding: 12px;
  /* text-align: center; */
  border: 1px solid #eee;
}

.forestry-name {
  font-weight: 400;
  background: #f5f5f5;
  /* text-align: left; */
  font-size: 0.9rem;
}

.total-cell {
  font-weight: 200;
  font-size: 0.9rem;
  text-align: right;
}

.total-cell.positive {
  /* color: #4caf50; */
}

.total-cell.penalty {
  color: #c62828;
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

  .indicator-col {
    min-width: 200px;
  }

  .forestry-header {
    min-width: 100px;
  }

  .value-input {
    width: 80px;
  }

  .total-table {
    max-width: 100%;
  }
}
</style>
