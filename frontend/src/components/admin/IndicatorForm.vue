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
            <option value="regular">📊 Обычный (расчет по формуле)</option>
            <option value="manual">
              ➕➖ Бонус/Штраф (ручной ввод баллов)
            </option>
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
              :disabled="form.type === 'manual'"
            />
            <small v-if="form.type === 'manual'" class="hint">
              Для бонусов/штрафов не используется
            </small>
          </div>

          <div class="form-group half">
            <label>Единица измерения</label>
            <input
              v-model="form.unit"
              type="text"
              :placeholder="getUnitPlaceholder"
              :disabled="form.type === 'manual'"
            />
            <small v-if="form.type === 'manual'" class="hint">
              Вводятся сразу баллы
            </small>
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
  type: "regular",
  max_weight: 50,
  unit: "",
  description: "",
  is_active: true,
});

watch(
  () => props.indicator,
  (newVal) => {
    if (newVal) {
      form.section_id = newVal.section_id || "";
      form.name = newVal.name || "";
      form.type = newVal.type || "regular";
      form.max_weight = newVal.max_weight || 50;
      form.unit = newVal.unit || "";
      form.description = newVal.description || "";
    } else {
      form.section_id = "";
      form.name = "";
      form.type = "regular";
      form.max_weight = 50;
      form.unit = "";
      form.description = "";
    }
  },
  { immediate: true },
);

const handleTypeChange = () => {
  if (form.type === "manual") {
    form.unit = ""; // Очищаем единицы измерения
    form.max_weight = 0; // Обнуляем макс. балл
  } else {
    form.unit = "га"; // Ставим значение по умолчанию
    form.max_weight = 50;
  }
};

const getUnitPlaceholder = computed(() => {
  return form.type === "manual" ? "баллы" : "га, км, шт, м³...";
});

const getDescriptionPlaceholder = computed(() => {
  return form.type === "manual"
    ? "За что начисляются баллы? Например: Премия за хорошую работу (+10) или штраф за нарушение (-5)"
    : "Как правильно заполнять этот показатель";
});

const getTypeHint = computed(() => {
  switch (form.type) {
    case "manual":
      return "Бонус/Штраф: вводите сразу баллы. Можно ставить как положительные (бонус), так и отрицательные (штраф) значения. Например: +10 за достижение, -5 за нарушение.";
    default:
      return "Обычные показатели вводятся в натурных единицах (га, км, шт). Баллы рассчитываются по формуле: (введенное значение / максимум по всем) * максимальный балл.";
  }
});

const handleSubmit = () => {
  // Для manual типа не отправляем max_weight и unit
  const submitData = { ...form };
  if (form.type === "manual") {
    // Можно оставить как есть или удалить ненужные поля
    // Бэкенд сам решит, что с ними делать
  }
  emit("save", submitData);
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
  background: white;
  border-radius: 8px;
}

.indicator-form h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
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
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Стили для заблокированных полей */
input:disabled,
select:disabled,
textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Информационные блоки */
.info-box {
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.info-box.regular {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.info-box.manual {
  background: #fff3e0;
  border: 1px solid #ffb74d;
  color: #e65100;
}

.info-box strong {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

/* Подсказки */
.hint {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  font-style: italic;
}

/* Кнопки */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-save {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e5e5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Стили для вкладки с ответственными */
.responsible-tab {
  padding: 10px 0;
  min-height: 300px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .indicator-form {
    min-width: auto;
    padding: 15px;
  }

  .form-row {
    flex-direction: column;
    gap: 10px;
  }

  .form-group.half {
    width: 100%;
  }

  .form-tabs {
    flex-wrap: wrap;
  }

  .form-tabs button {
    flex: 1;
    min-width: 120px;
  }
}

/* Скролл для длинных форм */
.indicator-form::-webkit-scrollbar {
  width: 8px;
}

.indicator-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.indicator-form::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.indicator-form::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
