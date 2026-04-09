// frontend/api/update-password.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ error: "userId и newPassword обязательны" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Пароль должен быть не менее 6 символов" });
  }

  // Проверяем наличие переменных окружения
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing env vars:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
    });
    return res.status(500).json({ error: "Ошибка конфигурации сервера" });
  }

  try {
    // Создаем админского клиента Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;

    res.status(200).json({ success: true, message: "Пароль успешно изменен" });
  } catch (error) {
    console.error("Ошибка смены пароля:", error);
    res.status(500).json({ error: error.message });
  }
}
