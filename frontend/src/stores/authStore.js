import { defineStore } from "pinia";
import { ref } from "vue";
import { supabase } from "../lib/supabase";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const isAuthenticated = ref(false);

  // Функция для получения роли из таблицы user_profiles
  const getUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("⚠️ Не удалось получить роль из profiles:", error.message);
        return null;
      }

      return data?.role;
    } catch (error) {
      console.warn("⚠️ Ошибка при получении роли:", error);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Получаем роль из таблицы user_profiles
      const profileRole = await getUserRole(data.user.id);

      // Если есть роль в profiles - используем её, иначе берем из метаданных
      const userRole = profileRole || data.user.user_metadata?.role || "viewer";

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
        // Получаем роль из таблицы user_profiles
        const profileRole = await getUserRole(supabaseUser.id);

        // Если есть роль в profiles - используем её, иначе из метаданных
        const userRole =
          profileRole || supabaseUser.user_metadata?.role || "viewer";

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
