<template>
  <div class="custom-date-picker">
    <DatePicker
      v-model="selectedDate"
      type="month"
      format="YYYY-MM"
      value-type="format"
      :clearable="false"
      :editable="false"
      :lang="lang"
      @change="handleDateChange"
    >
    </DatePicker>
  </div>
</template>

<script setup>
import { ref } from "vue";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    },
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const selectedDate = ref(props.modelValue);

// Настройки русского языка
const lang = {
  formatLocale: {
    firstDayOfWeek: 1,
    months: [
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
    ],
    monthsShort: [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ],
  },
};

// Класс для инпута (минимально скрываем)
const inputClass = "hidden-date-input";

const handleDateChange = (value) => {
  selectedDate.value = value;
  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<style scoped>
/* Минимально скрываем стандартный инпут */
:deep(.mx-input) {
  /* position: absolute; */
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.hidden-date-input {
  display: none;
  width: 0px;
}

.mx-datepicker {
  position: relative;
  display: inline-block;
  width: 32px;
}
</style>
