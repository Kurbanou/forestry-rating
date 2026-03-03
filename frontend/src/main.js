import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { api } from "./lib/supabase"; // ← ВАЖНО: импорт из supabase, а не из api.js

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.mount("#app");

// Для отладки
window.api = api;

// В самом конце main.js
window.authStore = useAuthStore();
window.dataStore = useDataStore();
