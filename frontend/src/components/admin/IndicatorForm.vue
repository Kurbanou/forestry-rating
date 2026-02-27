<template>
  <div class="indicator-form">
    <h3>{{ indicator ? "Редактировать показатель" : "Новый показатель" }}</h3>

    <!-- Вкладки -->
    <div class="form-tabs" v-if="indicator">
      <button
        @click="activeTab = 'main'"
        :class="{ active: activeTab === 'main' }"
      >
        📝 Основные
      </button>
      <button
        @click="activeTab = 'responsible'"
        :class="{ active: activeTab === 'responsible' }"
      >
        👥 Ответственные
      </button>
    </div>

    <!-- Основная форма -->
    <div v-show="activeTab === 'main'">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Раздел *</label>
          <select v-model="form.section_id" required>
            <option value="">Выберите раздел</option>
            <option
              v-for="section in sections"
              :key="section.id"
              :value="section.id"
            >
              {{ section.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Название показателя *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Например: Рубки ухода"
          />
        </div>

        <div class="form-group">
          <label>Тип показателя *</label>
          <select v-model="form.type" required @change="handleTypeChange">
            <option value="positive">📊 Обычный (расчет по формуле)</option>
            <option value="penalty">⚠️ Штрафной (вычитает баллы)</option>
            <option value="bonus">🎁 Бонусный (добавляет баллы)</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>Максимальный балл *</label>
            <input
              v-model="form.max_weight"
              type="number"
              required
              min="1"
              step="1"
            />
          </div>

          <div class="form-group half">
            <label>Единица измерения</label>
            <input
              v-model="form.unit"
              type="text"
              :placeholder="getUnitPlaceholder"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Описание / инструкция</label>
          <textarea
            v-model="form.description"
            rows="3"
            :placeholder="getDescriptionPlaceholder"
          ></textarea>
        </div>

        <div class="info-box" :class="form.type">
          <strong>ℹ️ Подсказка:</strong>
          {{ getTypeHint }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Сохранить</button>
          <button type="button" @click="$emit('cancel')" class="btn-cancel">
            Отмена
          </button>
        </div>
      </form>
    </div>

    <!-- Вкладка с ответственными -->
    <div v-show="activeTab === 'responsible'" class="responsible-tab">
      <ResponsibleManager
        :indicator-id="indicatorId"
        @changed="handleResponsibleChanged"
      />
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed, ref } from "vue";
import ResponsibleManager from "./ResponsibleManager.vue";

const props = defineProps({
  indicator: {
    type: Object,
    default: null,
  },
  sections: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["save", "cancel", "changed"]);

// Активная вкладка
const activeTab = ref("main");

// ID показателя для компонента ответственных
const indicatorId = computed(() => {
  return props.indicator?.id || null;
});

const form = reactive({
  section_id: "",
  name: "",
  type: "positive",
  max_weight: 50,
  unit: "га",
  description: "",
  is_active: true,
});

watch(
  () => props.indicator,
  (newVal) => {
    if (newVal) {
      form.section_id = newVal.section_id || "";
      form.name = newVal.name || "";
      form.type = newVal.type || "positive";
      form.max_weight = newVal.max_weight || 50;
      form.unit = newVal.unit || "га";
      form.description = newVal.description || "";
    } else {
      form.section_id = "";
      form.name = "";
      form.type = "positive";
      form.max_weight = 50;
      form.unit = "га";
      form.description = "";
    }
  },
  { immediate: true },
);

const handleTypeChange = () => {
  // Меняем подсказки в зависимости от типа
  switch (form.type) {
    case "penalty":
      form.unit = "баллы";
      break;
    case "bonus":
      form.unit = "баллы";
      break;
    default:
      form.unit = "га";
  }
};

const getUnitPlaceholder = computed(() => {
  switch (form.type) {
    case "penalty":
    case "bonus":
      return "баллы";
    default:
      return "га, км, шт, м³...";
  }
});

const getDescriptionPlaceholder = computed(() => {
  switch (form.type) {
    case "penalty":
      return "За что начисляется штраф? Например: За нарушение сроков";
    case "bonus":
      return "За что начисляется бонус? Например: За перевыполнение плана";
    default:
      return "Как правильно заполнять этот показатель";
  }
});

const getTypeHint = computed(() => {
  switch (form.type) {
    case "penalty":
      return "Штрафные показатели вводятся отрицательными числами (например: -50). Они автоматически вычтутся из общей суммы.";
    case "bonus":
      return "Бонусные показатели вводятся положительными числами (например: +30). Они добавятся к общей сумме.";
    default:
      return "Обычные показатели вводятся в натурных единицах (га, км, шт). Баллы рассчитываются по формуле: (введенное значение / максимум по всем) * максимальный балл.";
  }
});

const handleSubmit = () => {
  emit("save", { ...form });
};

const handleResponsibleChanged = () => {
  emit("changed");
};
</script>

<style scoped>
.indicator-form {
  padding: 20px;
  min-width: 600px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.indicator-form h3 {
  margin: 0 0 20px 0;
  color: #333;
}

/* Стили для вкладок */
.form-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.form-tabs button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.form-tabs button:hover {
  background: #f5f5f5;
}

.form-tabs button.active {
  background: #4caf50;
  color: white;
}

/* Основные стили формы */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.info-box {
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.info-box.positive {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.info-box.penalty {
  background: #ffebee;
  border: 1px solid #ef9a9a;
  color: #c62828;
}

.info-box.bonus {
  background: #fff8e1;
  border: 1px solid #ffe082;
  color: #ff8f00;
}

.info-box strong {
  display: block;
  margin-bottom: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-save {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-save:hover {
  background: #45a049;
}

.btn-cancel {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel:hover {
  background: #e5e5e5;
}

/* Стили для вкладки с ответственными */
.responsible-tab {
  padding: 10px 0;
}
</style>
