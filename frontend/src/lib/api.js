// frontend/src/lib/api.js
const API_URL = "http://localhost:3000/api";

async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ошибка API:", {
        status: response.status,
        endpoint,
        data,
      });
      throw new Error(data.error || `Ошибка ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Сетевая ошибка:", error);
    throw error;
  }
}

export const api = {
  // Аутентификация
  login: (email, password) =>
    fetchWithAuth("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email, password, role) =>
    fetchWithAuth("/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

  getMe: () => fetchWithAuth("/me"),

  // Разделы
  getSections: () => fetchWithAuth("/sections"),

  createSection: (section) =>
    fetchWithAuth("/sections", {
      method: "POST",
      body: JSON.stringify(section),
    }),

  updateSection: (id, section) =>
    fetchWithAuth(`/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(section),
    }),

  deleteSection: (id) =>
    fetchWithAuth(`/sections/${id}`, {
      method: "DELETE",
    }),

  // Показатели
  getIndicators: () => fetchWithAuth("/indicators"),

  createIndicator: (indicator) =>
    fetchWithAuth("/indicators", {
      method: "POST",
      body: JSON.stringify(indicator),
    }),

  updateIndicator: (id, indicator) =>
    fetchWithAuth(`/indicators/${id}`, {
      method: "PUT",
      body: JSON.stringify(indicator),
    }),

  deleteIndicator: (id) =>
    fetchWithAuth(`/indicators/${id}`, {
      method: "DELETE",
    }),

  // В объект api добавьте:

  // Ответственные за показатели
  getIndicatorResponsible: (indicatorId) =>
    fetchWithAuth(`/indicators/${indicatorId}/responsible`),

  addResponsible: (indicatorId, userId) =>
    fetchWithAuth(`/indicators/${indicatorId}/responsible`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    }),

  removeResponsible: (indicatorId, userId) =>
    fetchWithAuth(`/indicators/${indicatorId}/responsible/${userId}`, {
      method: "DELETE",
    }),

  // Инженеры
  getEngineers: () => fetchWithAuth("/users/engineers"),

  // Данные
  getForestries: () => fetchWithAuth("/forestries"),
  getRawData: (period) =>
    fetchWithAuth(`/raw-data${period ? `?period=${period}` : ""}`),
  saveRawData: (data) =>
    fetchWithAuth("/raw-data", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Пользователи
  getUsers: () => fetchWithAuth("/users"),

  getUser: (id) => fetchWithAuth(`/users/${id}`),

  createUser: (userData) =>
    fetchWithAuth("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  updateUser: (id, userData) =>
    fetchWithAuth(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    }),

  // Лесничества
  getForestries: () => fetchWithAuth("/forestries"),

  getForestry: (id) => fetchWithAuth(`/forestries/${id}`),

  createForestry: (data) =>
    fetchWithAuth("/forestries", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateForestry: (id, data) =>
    fetchWithAuth(`/forestries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteForestry: (id) =>
    fetchWithAuth(`/forestries/${id}`, {
      method: "DELETE",
    }),

  // В объект api добавьте:
  getIndicatorResponsible: () => fetchWithAuth("/indicator-responsible"),

  // Инженеры
  getEngineers: () => fetchWithAuth("/users/engineers"),
};
