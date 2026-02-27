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
  const loading = ref(false);
  const currentPeriod = ref(new Date().toISOString().slice(0, 7));

  // В dataStore.js добавьте эти функции

  // Получение баллов с учетом штрафов
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
      // Штрафные показатели: значение уже в баллах (отрицательное)
      score = -Math.abs(value); // Всегда отрицательное
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

  // Итоговый балл с учетом штрафов
  function getTotalScore(forestryId, period = currentPeriod.value) {
    let total = 0;
    indicators.value.forEach((indicator) => {
      total += getScore(forestryId, indicator.id, period);
    });
    return total.toFixed(2);
  }

  // Цвет для отображения (красный для штрафов)
  function getScoreClass(score) {
    if (score < 0) return "penalty";
    if (score > 0) return "positive";
    return "neutral";
  }

  // Загрузка всех данных
  async function loadAllData() {
    loading.value = true;
    try {
      const [forestriesData, sectionsData, indicatorsData, rawDataData] =
        await Promise.all([
          api.getForestries(),
          api.getSections(),
          api.getIndicators(),
          api.getRawData(currentPeriod.value),
        ]);

      forestries.value = forestriesData;
      sections.value = sectionsData;
      indicators.value = indicatorsData;
      rawData.value = rawDataData;
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

  // Проверка, может ли пользователь редактировать показатель
  const canEditIndicator = (indicatorId) => {
    if (authStore.user?.role === "admin") return true;
    // Позже добавим проверку для инженеров
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
  // В dataStore.js, добавьте кэширование для баллов
  const scoreCache = ref(new Map());

  function getScore(forestryId, indicatorId, period = currentPeriod.value) {
    const cacheKey = `${forestryId}-${indicatorId}-${period}`;

    // Если есть в кэше, возвращаем
    if (scoreCache.value.has(cacheKey)) {
      return scoreCache.value.get(cacheKey);
    }

    const value = getValue(forestryId, indicatorId, period);

    const maxValue = Math.max(
      ...rawData.value
        .filter(
          (r) => r.indicator_id === indicatorId && r.period?.startsWith(period),
        )
        .map((r) => r.value),
      0,
    );

    if (maxValue === 0) return 0;

    const indicator = indicators.value.find((i) => i.id === indicatorId);
    const score = Number(
      ((value / maxValue) * indicator.max_weight).toFixed(2),
    );

    // Сохраняем в кэш
    scoreCache.value.set(cacheKey, score);

    return score;
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
      const response = await api.saveRawData({
        forestry_id: forestryId,
        indicator_id: indicatorId,
        value,
        period,
      });

      // Вместо полной перезагрузки, обновляем локальные данные
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

      // Не вызываем loadAllData()!
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      throw error;
    }
  }

  // Итоговый балл для лесничества
  function getTotalScore(forestryId, period = currentPeriod.value) {
    let total = 0;
    indicators.value.forEach((indicator) => {
      total += getScore(forestryId, indicator.id, period);
    });
    return total.toFixed(2);
  }

  return {
    // State
    forestries,
    sections,
    indicators,
    rawData,
    loading,
    currentPeriod,

    // Getters
    getIndicatorsBySection,
    canEditIndicator,
    getValue,
    getScore,
    getTotalScore,

    // Actions
    loadAllData,
    saveValue,
  };
});
