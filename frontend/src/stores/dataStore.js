// frontend/src/stores/dataStore.js
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
  const responsible = ref([]); // Добавлено!
  const loading = ref(false);
  const currentPeriod = ref(new Date().toISOString().slice(0, 7));

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
        api.getIndicatorResponsible?.() || Promise.resolve([]), // Добавлено, с проверкой
      ]);

      forestries.value = forestriesData || [];
      sections.value = sectionsData || [];
      indicators.value = indicatorsData || [];
      rawData.value = rawDataData || [];
      responsible.value = responsibleData || [];

      // Очищаем кэш при загрузке новых данных
      scoreCache.value.clear();
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      loading.value = false;
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
    // Админ может всё
    if (authStore.user?.role === "admin") return true;

    // Инженер может редактировать только назначенные показатели
    if (authStore.user?.role === "engineer") {
      return isUserResponsibleForIndicator(authStore.user.id, indicatorId);
    }

    // Наблюдатели и гости не могут редактировать
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

    // Если есть в кэше, возвращаем
    if (scoreCache.value.has(cacheKey)) {
      return scoreCache.value.get(cacheKey);
    }

    const value = getValue(forestryId, indicatorId, period);
    const indicator = indicators.value.find((i) => i.id === indicatorId);

    if (!indicator) return 0;

    let score = 0;

    if (indicator.type === "penalty") {
      // Штрафные показатели: значение уже в баллах (отрицательное)
      score = -Math.abs(value); // Всегда отрицательное
    } else if (indicator.type === "bonus") {
      // Бонусные показатели: значение уже в баллах (положительное)
      score = Math.abs(value); // Всегда положительное
    } else {
      // Обычные показатели: расчет по формуле
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

      // Обновляем локальные данные без перезагрузки
      const fullPeriod = `${period}-01`;

      // Ищем существующую запись
      const existingIndex = rawData.value.findIndex(
        (r) =>
          r.forestry_id === forestryId &&
          r.indicator_id === indicatorId &&
          r.period === fullPeriod,
      );

      if (existingIndex >= 0) {
        // Обновляем существующую
        rawData.value[existingIndex].value = value;
        rawData.value[existingIndex].updated_at = new Date().toISOString();
      } else {
        // Добавляем новую
        rawData.value.push({
          id: Date.now(), // временный ID, при следующей загрузке заменится
          forestry_id: forestryId,
          indicator_id: indicatorId,
          value: value,
          period: fullPeriod,
          created_by: authStore.user?.id,
        });
      }

      // Очищаем кэш для этого показателя
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

  return {
    // State
    forestries,
    sections,
    indicators,
    rawData,
    responsible,
    loading,
    currentPeriod,

    // Getters
    getIndicatorsBySection,
    canEditIndicator,
    isUserResponsibleForIndicator,
    getValue,
    getScore,
    getTotalScore,
    getScoreClass,

    // Actions
    loadAllData,
    saveValue,
  };
});
