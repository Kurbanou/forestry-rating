import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Ошибка: Не найдены переменные окружения для Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  // ============ Аутентификация ============
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Получаем профиль пользователя из нашей таблицы
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.warn("⚠️ Не удалось получить профиль:", profileError);
    }

    // Используем роль из профиля, если есть, иначе из метаданных
    const role = profile?.role || data.user.user_metadata?.role || "viewer";

    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: role, // ← теперь берем из user_profiles
      },
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn("⚠️ Не удалось получить профиль:", profileError);
    }

    return {
      id: user.id,
      email: user.email,
      role: profile?.role || user.user_metadata?.role || "viewer",
    };
  },

  // ============ Лесничества (FORESTRIES) ============
  getForestries: async () => {
    const { data, error } = await supabase
      .from("forestries")
      .select("*")
      .order("id");
    if (error) throw error;
    return data;
  },

  createForestry: async (data) => {
    const { data: result, error } = await supabase
      .from("forestries")
      .insert([{ name: data.name }])
      .select();
    if (error) throw error;
    return result[0];
  },

  updateForestry: async (id, data) => {
    const { data: result, error } = await supabase
      .from("forestries")
      .update({ name: data.name })
      .eq("id", id)
      .select();
    if (error) throw error;
    return result[0];
  },

  deleteForestry: async (id) => {
    const { error } = await supabase.from("forestries").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  // ============ Разделы (SECTIONS) ============
  getSections: async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  },

  createSection: async (section) => {
    const { data: result, error } = await supabase
      .from("sections")
      .insert([
        {
          name: section.name,
          description: section.description,
          sort_order: section.sort_order || 0,
        },
      ])
      .select();
    if (error) throw error;
    return result[0];
  },

  updateSection: async (id, section) => {
    const { data: result, error } = await supabase
      .from("sections")
      .update({
        name: section.name,
        description: section.description,
        sort_order: section.sort_order,
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return result[0];
  },

  deleteSection: async (id) => {
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  // ============ Показатели (INDICATORS) ============
  getIndicators: async () => {
    const { data, error } = await supabase
      .from("indicators")
      .select("*")
      .eq("is_active", true)
      .order("id");
    if (error) throw error;
    return data;
  },

  createIndicator: async (indicator) => {
    const { data: result, error } = await supabase
      .from("indicators")
      .insert([
        {
          section_id: indicator.section_id,
          name: indicator.name,
          max_weight: indicator.max_weight,
          unit: indicator.unit || "га",
          description: indicator.description,
          type: indicator.type || "positive",
          is_active: true,
        },
      ])
      .select();
    if (error) throw error;
    return result[0];
  },

  updateIndicator: async (id, indicator) => {
    const { data: result, error } = await supabase
      .from("indicators")
      .update({
        section_id: indicator.section_id,
        name: indicator.name,
        max_weight: indicator.max_weight,
        unit: indicator.unit,
        description: indicator.description,
        type: indicator.type,
      })
      .eq("id", id)
      .select();
    if (error) throw error;
    return result[0];
  },

  deleteIndicator: async (id) => {
    const { data: result, error } = await supabase
      .from("indicators")
      .update({ is_active: false })
      .eq("id", id)
      .select();
    if (error) throw error;
    return result[0];
  },

  // ============ Пользователи (USERS) ============
  /// ============ Пользователи (USERS) ============
  getUsers: async () => {
    try {
      // Простой запрос к user_profiles
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("email");

      if (error) {
        console.error("Ошибка Supabase:", error);
        throw error;
      }

      console.log("✅ Загружено пользователей:", data?.length);
      return data || [];
    } catch (error) {
      console.error("❌ Ошибка получения пользователей:", error);
      return [];
    }
  },

  createUser: async (userData) => {
    try {
      // Сначала создаем пользователя в auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: { role: userData.role },
        });

      if (authError) throw authError;

      // Профиль создастся автоматически через триггер
      return {
        id: authData.user.id,
        email: authData.user.email,
        role: userData.role,
      };
    } catch (error) {
      console.error("❌ Ошибка создания пользователя:", error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      // Обновляем профиль
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          email: userData.email,
          role: userData.role,
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("❌ Ошибка обновления пользователя:", error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      // Удаляем через admin API
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("❌ Ошибка удаления пользователя:", error);
      throw error;
    }
  },

  // ============ Инженеры ============
  getEngineers: async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email")
      .eq("role", "engineer");

    if (error) throw error;
    return data || [];
  },

  // ============ Ответственные за показатели ============
  // ============ Ответственные за показатели ============
  getIndicatorResponsible: async (indicatorId) => {
    try {
      // Простой запрос без JOIN, получим данные и потом отдельно пользователей
      const { data, error } = await supabase
        .from("indicator_responsible")
        .select("*")
        .eq("indicator_id", indicatorId);

      if (error) throw error;

      // Если есть данные, получим информацию о пользователях
      if (data && data.length > 0) {
        const userIds = data.map((item) => item.user_id);
        const { data: users, error: usersError } = await supabase
          .from("user_profiles")
          .select("id, email, role")
          .in("id", userIds);

        if (usersError) throw usersError;

        // Объединяем данные
        return data.map((item) => ({
          ...item,
          user_email: users.find((u) => u.id === item.user_id)?.email,
          user_role: users.find((u) => u.id === item.user_id)?.role,
        }));
      }

      return data || [];
    } catch (error) {
      console.error("Ошибка получения ответственных:", error);
      return [];
    }
  },

  // Метод для получения всех ответственных
  getAllResponsible: async () => {
    try {
      console.log("📥 Загружаем всех ответственных...");

      // Сначала получаем все назначения
      const { data: irData, error: irError } = await supabase
        .from("indicator_responsible")
        .select("*");

      if (irError) throw irError;

      console.log("✅ Назначения загружены:", irData?.length);

      if (!irData || irData.length === 0) {
        return [];
      }

      // Получаем ID всех пользователей и показателей
      const userIds = [...new Set(irData.map((item) => item.user_id))];
      const indicatorIds = [
        ...new Set(irData.map((item) => item.indicator_id)),
      ];

      // Загружаем пользователей
      const { data: users, error: usersError } = await supabase
        .from("user_profiles")
        .select("id, email, role")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Загружаем показатели
      const { data: indicators, error: indError } = await supabase
        .from("indicators")
        .select("id, name")
        .in("id", indicatorIds);

      if (indError) throw indError;

      // Собираем всё вместе
      const result = irData.map((item) => {
        const user = users?.find((u) => u.id === item.user_id);
        const indicator = indicators?.find((i) => i.id === item.indicator_id);

        return {
          id: item.id,
          indicator_id: item.indicator_id,
          indicator_name: indicator?.name || "Неизвестно",
          user_id: item.user_id,
          user_email: user?.email,
          user_role: user?.role,
          assigned_at: item.assigned_at,
        };
      });

      console.log("📦 Итоговые данные:", result);

      // Проверяем для nach
      const nachId = "6d5025d2-9036-4c42-affe-08fe144b0147";
      const nachData = result.filter((r) => r.user_id === nachId);
      console.log("👤 Назначения для nach:", nachData);

      return result;
    } catch (error) {
      console.error("❌ Ошибка получения всех ответственных:", error);
      return [];
    }
  },

  addResponsible: async (indicatorId, userId) => {
    const { data, error } = await supabase
      .from("indicator_responsible")
      .insert([
        {
          indicator_id: indicatorId,
          user_id: userId,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  removeResponsible: async (indicatorId, userId) => {
    const { error } = await supabase
      .from("indicator_responsible")
      .delete()
      .eq("indicator_id", indicatorId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  },

  // ============ Данные (RAW_DATA) ============
  getRawData: async (period) => {
    let query = supabase.from("raw_data").select("*");

    if (period && period !== "all") {
      query = query.ilike("period", `${period}%`);
    }

    const { data, error } = await query.order("period");
    if (error) throw error;
    return data;
  },

  getAllRawData: async () => {
    const { data, error } = await supabase
      .from("raw_data")
      .select("*")
      .order("period");
    if (error) throw error;
    return data;
  },

  saveRawData: async (data) => {
    const { data: result, error } = await supabase
      .from("raw_data")
      .upsert(
        {
          forestry_id: data.forestry_id,
          indicator_id: data.indicator_id,
          value: data.value,
          period: data.period.split("T")[0],
        },
        { onConflict: "forestry_id,indicator_id,period" },
      )
      .select();

    if (error) throw error;
    return result[0];
  },
};
