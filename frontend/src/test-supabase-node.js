// Прямое указание переменных для теста
const SUPABASE_URL = "https://uckflpnuhycfjcvcppon.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_20ES7Yy1aTo_TiuVWFqNpg_A_axZF57";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log("🔍 Тестируем подключение к Supabase...");
  console.log("URL:", SUPABASE_URL);

  try {
    // Проверяем лесничества
    const { data: forestries, error: err1 } = await supabase
      .from("forestries")
      .select("*");

    if (err1) {
      console.error("❌ Ошибка при получении лесничеств:", err1.message);
    } else {
      console.log("✅ Лесничества загружены:", forestries.length);
      console.log("   Первое лесничество:", forestries[0]);
    }

    // Проверяем показатели
    const { data: indicators, error: err2 } = await supabase
      .from("indicators")
      .select("*")
      .limit(5);

    if (err2) {
      console.error("❌ Ошибка при получении показателей:", err2.message);
    } else {
      console.log("✅ Показатели загружены:", indicators.length);
    }

    // Проверяем данные
    const { data: rawData, error: err3 } = await supabase
      .from("raw_data")
      .select("*")
      .limit(5);

    if (err3) {
      console.error("❌ Ошибка при получении данных:", err3.message);
    } else {
      console.log("✅ Данные загружены:", rawData.length);
    }
  } catch (error) {
    console.error("❌ Непредвиденная ошибка:", error);
  }
}

testConnection();
