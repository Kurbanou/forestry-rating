// frontend/src/lib/api.js
const API_URL = "http://localhost:3000/api";

// Вспомогательная функция для запросов с токеном
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Ошибка запроса");
  }

  return data;
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

  // Данные
  getForestries: () => fetchWithAuth("/forestries"),
  getSections: () => fetchWithAuth("/sections"),
  getIndicators: () => fetchWithAuth("/indicators"),
  getRawData: (period) =>
    fetchWithAuth(`/raw-data${period ? `?period=${period}` : ""}`),

  // Сохранение данных
  saveRawData: (data) =>
    fetchWithAuth("/raw-data", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
