import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { api } from "./lib/supabase";
import "@fortawesome/fontawesome-free/css/all.css";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./assets/styles/element-variables.css"; // до импорта Element Plus

// 👇 Импортируем русский язык
import ru from "element-plus/es/locale/lang/ru";
// Для Day.js (календари) тоже нужен русский
import "dayjs/locale/ru";

const app = createApp(App);
const pinia = createPinia();

// 👇 Подключаем плагины с русским языком
app.use(pinia);
app.use(ElementPlus, {
  locale: ru, // <- вот здесь указываем русский язык
});

app.mount("#app");
