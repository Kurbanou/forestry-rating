import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: App, // или Dashboard, если есть отдельный компонент
    },
    {
      path: "/login",
      name: "login",
      // Можно добавить отдельную страницу логина, если нужно
      beforeEnter: (to, from, next) => {
        // Перенаправляем на главную, модалка логина уже есть в App.vue
        next("/");
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "/", // Любые неизвестные пути ведут на главную
    },
  ],
});

// Защита маршрутов (если нужна)
router.beforeEach((to, from, next) => {
  // Проверка авторизации для защищенных маршрутов
  const isAuthenticated = localStorage.getItem("token");

  // Если маршрут требует авторизации, а пользователь не авторизован
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
