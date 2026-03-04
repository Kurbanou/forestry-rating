import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { api } from "./lib/supabase"; // ← ВАЖНО: импорт из supabase, а не из api.js
import "@fortawesome/fontawesome-free/css/all.css"; // ← добавь эту строку

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.mount("#app");
