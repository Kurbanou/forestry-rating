import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Ошибка: Не найдены переменные окружения для Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API методы для работы с данными через Supabase (НЕ через localhost!)
export const api = {
  // Аутентификация
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || "viewer",
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
    return user;
  },

  // Лесничества
  getForestries: async () => {
    const { data, error } = await supabase
      .from("forestries")
      .select("*")
      .order("id");
    if (error) throw error;
    return data;
  },

  // Разделы
  getSections: async () => {
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data;
  },

  // Показатели
  getIndicators: async () => {
    const { data, error } = await supabase
      .from("indicators")
      .select("*")
      .eq("is_active", true)
      .order("id");
    if (error) throw error;
    return data;
  },

  // Данные
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
          period: `${data.period}-01`,
        },
        { onConflict: "forestry_id,indicator_id,period" },
      )
      .select();

    if (error) throw error;
    return result[0];
  },

  // Ответственные
  getIndicatorResponsible: async (indicatorId) => {
    const { data, error } = await supabase
      .from("indicator_responsible")
      .select("*, users:user_id(email)")
      .eq("indicator_id", indicatorId);

    if (error) throw error;
    return data;
  },

  addResponsible: async (indicatorId, userId) => {
    const { data, error } = await supabase
      .from("indicator_responsible")
      .insert({
        indicator_id: indicatorId,
        user_id: userId,
      })
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

  // Инженеры (из public.users если есть, иначе пустой массив)
  getEngineers: async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email")
        .eq("role", "engineer");

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn("⚠️ Не удалось получить инженеров:", e);
      return [];
    }
  },
};
