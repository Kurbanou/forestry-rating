import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { api } from "../lib/api";
import { useAuthStore } from "./authStore";

export const useDataStore = defineStore("data", () => {
  const authStore = useAuthStore();

  const forestries = ref([]);
  const sections = ref([]);
  const indicators = ref([]);
  const rawData = ref([]);
  const responsible = ref([]);
  const loading = ref(false);
  const currentPeriod = ref(new Date().toISOString().slice(0, 7));

  // 👇 ДОБАВЛЯЕМ пользователей
  const users = ref([]);

  // Кэш для баллов
  const scoreCache = ref(new Map());

  // Загрузка всех данных
  async function loadAllData() {
    loading.value = true;
    try {
      const [
        forestriesData,
        sectionsData,
        indicatorsData,
        rawDataData,
        responsibleData,
      ] = await Promise.all([
        api.getForestries(),
        api.getSections(),
        api.getIndicators(),
        api.getRawData(currentPeriod.value),
        api.getAllResponsible(),
      ]);

      forestries.value = forestriesData || [];
      sections.value = sectionsData || [];
      indicators.value = indicatorsData || [];
      rawData.value = rawDataData || [];
      responsible.value = responsibleData || [];

      console.log("Загружены ответственные:", responsible.value.length);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      loading.value = false;
    }
  }

  // 👇 НОВЫЕ МЕТОДЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
  async function fetchUsers() {
    try {
      users.value = await api.getUsers();
      return users.value;
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
      return [];
    }
  }

  async function createUser(userData) {
    try {
      const newUser = await api.createUser(userData);
      users.value.push(newUser);
      return newUser;
    } catch (error) {
      console.error("Ошибка создания пользователя:", error);
      throw error;
    }
  }

  async function updateUser(id, userData) {
    try {
      const updatedUser = await api.updateUser(id, userData);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      return updatedUser;
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
      throw error;
    }
  }

  async function deleteUser(id) {
    try {
      await api.deleteUser(id);
      users.value = users.value.filter((u) => u.id !== id);
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      throw error;
    }
  }

  // Получение показателей по разделу
  const getIndicatorsBySection = (sectionId) => {
    return indicators.value.filter((i) => i.section_id === sectionId);
  };

  // Проверка, отвечает ли пользователь за показатель
  function isUserResponsibleForIndicator(userId, indicatorId) {
    if (!userId || !indicatorId) return false;
    return responsible.value.some(
      (r) => r.user_id === userId && r.indicator_id === indicatorId,
    );
  }

  // Проверка, может ли пользователь редактировать показатель
  const canEditIndicator = (indicatorId) => {
    if (authStore.user?.role === "admin") return true;
    if (authStore.user?.role === "engineer") {
      return isUserResponsibleForIndicator(authStore.user.id, indicatorId);
    }
    return false;
  };

  // Получение значения для конкретной ячейки
  function getValue(forestryId, indicatorId, period = currentPeriod.value) {
    const item = rawData.value.find(
      (r) =>
        r.forestry_id === forestryId &&
        r.indicator_id === indicatorId &&
        r.period?.startsWith(period),
    );
    return item?.value || 0;
  }

  // Получение баллов для конкретной ячейки
  function getScore(forestryId, indicatorId, period = currentPeriod.value) {
    const cacheKey = `${forestryId}-${indicatorId}-${period}`;

    if (scoreCache.value.has(cacheKey)) {
      return scoreCache.value.get(cacheKey);
    }

    const value = getValue(forestryId, indicatorId, period);
    const indicator = indicators.value.find((i) => i.id === indicatorId);

    if (!indicator) return 0;

    let score = 0;

    if (indicator.type === "penalty") {
      score = -Math.abs(value);
    } else if (indicator.type === "bonus") {
      score = Math.abs(value);
    } else {
      const maxValue = Math.max(
        0,
        ...rawData.value
          .filter(
            (r) =>
              r.indicator_id === indicatorId && r.period?.startsWith(period),
          )
          .map((r) => r.value),
      );

      if (maxValue > 0) {
        score = (value / maxValue) * indicator.max_weight;
      }
    }

    score = Number(score.toFixed(2));
    scoreCache.value.set(cacheKey, score);

    return score;
  }

  // Итоговый балл для лесничества
  function getTotalScore(forestryId, period = currentPeriod.value) {
    let total = 0;
    indicators.value.forEach((indicator) => {
      total += getScore(forestryId, indicator.id, period);
    });
    return total.toFixed(2);
  }

  // Цвет для отображения
  function getScoreClass(score) {
    if (score < 0) return "penalty";
    if (score > 0) return "positive";
    return "neutral";
  }

  // Очищаем кэш при изменении данных
  watch(
    rawData,
    () => {
      scoreCache.value.clear();
    },
    { deep: true },
  );

  // Сохранение значения
  async function saveValue(
    forestryId,
    indicatorId,
    value,
    period = currentPeriod.value,
  ) {
    try {
      await api.saveRawData({
        forestry_id: forestryId,
        indicator_id: indicatorId,
        value,
        period,
      });

      const fullPeriod = `${period}-01`;

      const existingIndex = rawData.value.findIndex(
        (r) =>
          r.forestry_id === forestryId &&
          r.indicator_id === indicatorId &&
          r.period === fullPeriod,
      );

      if (existingIndex >= 0) {
        rawData.value[existingIndex].value = value;
        rawData.value[existingIndex].updated_at = new Date().toISOString();
      } else {
        rawData.value.push({
          id: Date.now(),
          forestry_id: forestryId,
          indicator_id: indicatorId,
          value: value,
          period: fullPeriod,
          created_by: authStore.user?.id,
        });
      }

      for (let key of scoreCache.value.keys()) {
        if (key.includes(`-${indicatorId}-`)) {
          scoreCache.value.delete(key);
        }
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      throw error;
    }
  }

  // 👇 НЕ ЗАБЫТЬ ДОБАВИТЬ В RETURN
  return {
    forestries,
    sections,
    indicators,
    rawData,
    responsible,
    users, // <-- добавить
    loading,
    currentPeriod,
    getIndicatorsBySection,
    canEditIndicator,
    isUserResponsibleForIndicator,
    getValue,
    getScore,
    getTotalScore,
    getScoreClass,
    loadAllData,
    saveValue,
    fetchUsers, // <-- добавить
    createUser, // <-- добавить
    updateUser, // <-- добавить
    deleteUser, // <-- добавить
  };
});
