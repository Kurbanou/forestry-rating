import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isAuthenticated = ref(false);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ВАЖНО: Сначала берем роль из метаданных пользователя
      const userRole = data.user.user_metadata?.role || "viewer";

      user.value = {
        id: data.user.id,
        email: data.user.email,
        role: userRole,
      };

      isAuthenticated.value = true;
      console.log("✅ Вошли, пользователь:", user.value);

      return data;
    } catch (error) {
      console.error("Ошибка входа:", error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    user.value = null;
    isAuthenticated.value = false;
  };

  const checkAuth = async () => {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        // ВАЖНО: Берем роль из метаданных
        const userRole = supabaseUser.user_metadata?.role || "viewer";

        user.value = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: userRole,
        };
        isAuthenticated.value = true;
        console.log("✅ Проверка авторизации:", user.value);
      } else {
        user.value = null;
        isAuthenticated.value = false;
      }

      return isAuthenticated.value;
    } catch (error) {
      console.error("Ошибка проверки:", error);
      user.value = null;
      isAuthenticated.value = false;
      return false;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
});
