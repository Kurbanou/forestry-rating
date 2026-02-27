<template>
  <div class="section-form">
    <h3>{{ section ? "Редактировать раздел" : "Новый раздел" }}</h3>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название раздела *</label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Например: Лесохозяйственные работы"
        />
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Опишите, что входит в этот раздел"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Порядок сортировки</label>
        <input
          v-model="form.sort_order"
          type="number"
          min="0"
          placeholder="0"
        />
        <small>Чем меньше число, тем выше раздел в списке</small>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save">Сохранить</button>
        <button type="button" @click="$emit('cancel')" class="btn-cancel">
          Отмена
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  section: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["save", "cancel"]);

const form = reactive({
  name: "",
  description: "",
  sort_order: 0,
});

watch(
  () => props.section,
  (newVal) => {
    if (newVal) {
      form.name = newVal.name || "";
      form.description = newVal.description || "";
      form.sort_order = newVal.sort_order || 0;
    } else {
      form.name = "";
      form.description = "";
      form.sort_order = 0;
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  emit("save", { ...form });
};
</script>

<style scoped>
.section-form {
  padding: 20px;
  min-width: 500px;
}

.section-form h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
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

.form-group small {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
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
</style>
