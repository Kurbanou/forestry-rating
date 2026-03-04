<template>
  <div class="custom-date-picker">
    <el-date-picker
      v-model="selectedDate"
      type="month"
      placeholder="Выберите месяц"
      format="YYYY MMMM"
      value-format="YYYY-MM"
      :clearable="false"
      :editable="false"
      :teleported="true"
      @change="handleDateChange"
      size="large"
    >
      <template #prefix>
        <i class="fa-regular fa-calendar"></i>
      </template>
    </el-date-picker>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

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

watch(
  () => props.modelValue,
  (newVal) => {
    selectedDate.value = newVal;
  },
);

const handleDateChange = (value) => {
  selectedDate.value = value;
  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<style scoped>
.custom-date-picker {
  display: inline-block;
}

/* Минимальные стили только для позиционирования */
.custom-date-picker :deep(.el-input__wrapper) {
  border-radius: 4px;
  user-select: none;
  cursor: pointer;
}

.custom-date-picker :deep(.el-input__prefix i) {
  font-size: 14px;
  color: #4caf50;
}

/* 👇 ВОТ РАБОЧИЙ СТИЛЬ ДЛЯ БОЛЬШОЙ БУКВЫ */
.custom-date-picker :deep(.el-input__inner) {
  text-transform: capitalize !important; /* !important чтобы перебить стили библиотеки */
}
</style>
