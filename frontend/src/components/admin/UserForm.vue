<template>
  <div class="user-form">
    <h3>{{ user ? "Редактировать пользователя" : "Новый пользователь" }}</h3>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Email *</label>
        <input
          v-model="form.email"
          type="email"
          required
          placeholder="user@example.com"
        />
      </div>

      <!-- 👇 ПОЛЕ ДЛЯ ПАРОЛЯ ПРИ РЕДАКТИРОВАНИИ (НОВОЕ) -->
      <div class="form-group" v-if="user">
        <label>Новый пароль</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="Оставьте пустым, если не хотите менять"
          minlength="4"
        />
        <small class="hint"
          >Заполните, только если хотите сменить пароль. Минимум 4
          символа</small
        >
      </div>

      <!-- 👇 ПОЛЕ ДЛЯ ПАРОЛЯ ПРИ СОЗДАНИИ (БЫЛО) -->
      <div class="form-group" v-else>
        <label>Пароль *</label>
        <input
          v-model="form.password"
          type="password"
          required
          placeholder="••••••••"
          minlength="4"
        />
        <small class="hint">Минимум 4 символа</small>
      </div>

      <div class="form-group">
        <label>Роль *</label>
        <select v-model="form.role" required>
          <option value="admin">👑 Администратор</option>
          <option value="engineer">👷 Инженер</option>
          <option value="viewer">👀 Наблюдатель</option>
        </select>
      </div>

      <div class="form-group" v-if="form.role === 'engineer'">
        <label>Лесничества (можно выбрать несколько)</label>
        <div class="forestries-checkbox">
          <div
            v-for="forestry in forestries"
            :key="forestry.id"
            class="checkbox-item"
          >
            <label>
              <input
                type="checkbox"
                :value="forestry.id"
                v-model="form.forestry_ids"
              />
              {{ forestry.name }}
            </label>
          </div>
        </div>
        <small class="hint"
          >Инженер сможет редактировать данные только по этим
          лесничествам</small
        >
      </div>

      <div class="info-box" v-if="form.role === 'admin'">
        <strong>👑 Администратор</strong>
        <p>Имеет полный доступ ко всем функциям системы</p>
      </div>

      <div class="info-box" v-else-if="form.role === 'engineer'">
        <strong>👷 Инженер</strong>
        <p>Может вводить данные только по назначенным лесничествам</p>
      </div>

      <div class="info-box" v-else-if="form.role === 'viewer'">
        <strong>👀 Наблюдатель</strong>
        <p>Может только просматривать данные, без права редактирования</p>
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
import { reactive, watch, ref, onMounted } from "vue";
import { api } from "../../lib/supabase"; // ← ИЗМЕНИТЬ!

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["save", "cancel"]);

const forestries = ref([]);

const form = reactive({
  email: "",
  password: "",
  role: "viewer",
  forestry_ids: [],
});

// Загружаем список лесничеств
onMounted(async () => {
  try {
    forestries.value = await api.getForestries();
  } catch (error) {
    console.error("Ошибка загрузки лесничеств:", error);
  }
});

watch(
  () => props.user,
  (newVal) => {
    if (newVal) {
      form.email = newVal.email || "";
      form.role = newVal.role || "viewer";
      form.forestry_ids = newVal.forestry_ids || [];
      form.password = ""; // 👈 ВАЖНО: сбрасываем пароль при открытии формы редактирования
    } else {
      form.email = "";
      form.password = "";
      form.role = "viewer";
      form.forestry_ids = [];
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  // Если это редактирование и пароль пустой - удаляем его из данных
  const submitData = { ...form };

  // 👇 Для редактирования: если пароль пустой - не отправляем его
  if (props.user && !submitData.password) {
    delete submitData.password;
  }

  emit("save", submitData);
};
</script>
<style scoped>
.user-form {
  padding: 20px;
  min-width: 500px;
  max-width: 600px;
}

.user-form h3 {
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
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.forestries-checkbox {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  background: #f9f9f9;
}

.checkbox-item {
  padding: 5px;
}

.checkbox-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
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
