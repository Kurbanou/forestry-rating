// frontend/src/stores/authStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "../lib/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token"));
  const isAuthenticated = ref(!!token.value);

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);

      user.value = data.user;
      token.value = data.token;
      localStorage.setItem("token", data.token);
      isAuthenticated.value = true;

      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, role) => {
    try {
      const data = await api.register(email, password, role);
      // После регистрации автоматически входим
      await login(email, password);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
    isAuthenticated.value = false;
  };

  const checkAuth = async () => {
    if (!token.value) return false;

    try {
      const userData = await api.getMe();
      user.value = userData;
      isAuthenticated.value = true;
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
});
