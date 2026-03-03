import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { useAuthStore } from "./stores/authStore";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.mount("#app");

// Сделаем store доступным в консоли для отладки
window.authStore = useAuthStore();
window.supabase = (await import("./lib/supabase")).supabase;
