import { createClient } from "@supabase/supabase-js";

// Пока используем заглушку, позже заменим на реальный Supabase
const supabaseUrl = "http://localhost:8000";
const supabaseKey = "dummy-key";

export const supabase = createClient(supabaseUrl, supabaseKey);
