<template>
  <div class="forestry-form">
    <h3>{{ forestry ? "Редактировать лесничество" : "Новое лесничество" }}</h3>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название лесничества *</label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Например: Алтайское лесничество"
        />
      </div>

      <div class="info-box">
        <strong>ℹ️ Информация</strong>
        <p>
          После создания лесничества оно появится в таблице данных и в списках
          выбора.
        </p>
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
  forestry: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["save", "cancel"]);

const form = reactive({
  name: "",
});

watch(
  () => props.forestry,
  (newVal) => {
    if (newVal) {
      form.name = newVal.name || "";
    } else {
      form.name = "";
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  emit("save", { ...form });
};
</script>

<style scoped>
.forestry-form {
  padding: 20px;
  min-width: 400px;
  max-width: 500px;
}

.forestry-form h3 {
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

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.info-box {
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1565c0;
}

.info-box strong {
  display: block;
  margin-bottom: 5px;
}

.info-box p {
  margin: 0;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
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
