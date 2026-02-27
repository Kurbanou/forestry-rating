<template>
  <div class="auth-modal" v-if="show">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>

      <h2>{{ isLogin ? "Вход" : "Регистрация" }}</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="form.email"
            required
            placeholder="email@example.com"
          />
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input
            type="password"
            v-model="form.password"
            required
            placeholder="••••••••"
          />
        </div>

        <div class="form-group" v-if="!isLogin">
          <label>Роль</label>
          <select v-model="form.role">
            <option value="engineer">Инженер</option>
            <option value="viewer">Наблюдатель</option>
          </select>
          <small class="hint">Админ может создать только администратор</small>
        </div>

        <button type="submit" class="submit-btn">
          {{ isLogin ? "Войти" : "Зарегистрироваться" }}
        </button>
      </form>

      <p class="toggle">
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{
            isLogin
              ? "Нет аккаунта? Зарегистрироваться"
              : "Уже есть аккаунт? Войти"
          }}
        </a>
      </p>

      <!-- Тестовые данные для входа -->
      <div class="test-data" v-if="isLogin">
        <p><strong>Тестовые аккаунты:</strong></p>
        <p>Админ: admin@example.com / admin123</p>
        <p>Инженер: engineer@example.com / engineer123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close", "login"]);

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const form = reactive({
  email: "",
  password: "",
  role: "engineer",
});

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await authStore.login(form.email, form.password);
    } else {
      await authStore.register(form.email, form.password, form.role);
    }

    emit("login");
    emit("close");

    // Очищаем форму
    form.email = "";
    form.password = "";
    form.role = "engineer";
  } catch (error) {
    alert(error.message);
  }
};
</script>

<style scoped>
.auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  z-index: 1001;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
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
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.hint {
  display: block;
  margin-top: 5px;
  color: #999;
  font-size: 12px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #45a049;
}

.toggle {
  margin-top: 15px;
  text-align: center;
}

.toggle a {
  color: #4caf50;
  text-decoration: none;
}

.toggle a:hover {
  text-decoration: underline;
}

.test-data {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
}

.test-data p {
  margin: 5px 0;
  color: #666;
}
</style>
