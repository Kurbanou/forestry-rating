import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { api } from "../lib/supabase"; // ← ИЗМЕНИТЬ ЭТУ СТРОКУ!
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

  const dataLoaded = ref(false);
  const users = ref([]);
  const scoreCache = ref(new Map());

  // Загрузка всех данных
  async function loadAllData() {
    loading.value = true;
    try {
      const [forestriesData, sectionsData, indicatorsData, rawDataData] =
        await Promise.all([
          api.getForestries(),
          api.getSections(),
          api.getIndicators(),
          api.getAllRawData(), // Загружаем все данные
        ]);

      forestries.value = forestriesData || [];
      sections.value = sectionsData || [];
      indicators.value = indicatorsData || [];
      rawData.value = rawDataData || [];

      console.log("✅ Загружено записей rawData:", rawDataData?.length || 0);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      loading.value = false;
    }
  }

  // Методы для пользователей (временно отключаем, пока не настроим в Supabase)
  async function fetchUsers() {
    try {
      const data = await api.getUsers();
      users.value = data || [];
      console.log("✅ Загружено пользователей:", users.value.length);
      return users.value;
    } catch (error) {
      console.error("❌ Ошибка загрузки пользователей:", error);
      users.value = [];
      return [];
    }
  }

  async function createUser(userData) {
    console.warn("⚠️ createUser временно не доступен");
    return null;
  }

  async function updateUser(id, userData) {
    console.warn("⚠️ updateUser временно не доступен");
    return null;
  }

  async function deleteUser(id) {
    console.warn("⚠️ deleteUser временно не доступен");
  }

  const getIndicatorsBySection = (sectionId) => {
    return indicators.value.filter((i) => i.section_id === sectionId);
  };

  function isUserResponsibleForIndicator(userId, indicatorId) {
    if (!userId || !indicatorId) return false;
    return responsible.value.some(
      (r) => r.user_id === userId && r.indicator_id === indicatorId,
    );
  }

  const canEditIndicator = (indicatorId) => {
    if (authStore.user?.role === "admin") return true;
    if (authStore.user?.role === "engineer") {
      return isUserResponsibleForIndicator(authStore.user.id, indicatorId);
    }
    return false;
  };

  function getValue(forestryId, indicatorId, period = currentPeriod.value) {
    const [year, month] = period.split("-").map(Number);

    const item = rawData.value.find((r) => {
      if (!r.period) return false;

      const date = new Date(r.period);
      const localDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
      const itemYear = localDate.getFullYear();
      const itemMonth = localDate.getMonth() + 1;

      return (
        r.forestry_id === forestryId &&
        r.indicator_id === indicatorId &&
        itemYear === year &&
        itemMonth === month
      );
    });

    return item?.value !== undefined ? Number(item.value) : 0;
  }

  function getScore(forestryId, indicatorId, period = currentPeriod.value) {
    const cacheKey = `${forestryId}-${indicatorId}-${period}`;

    if (scoreCache.value.has(cacheKey)) {
      return scoreCache.value.get(cacheKey);
    }

    const value = getValue(forestryId, indicatorId, period);
    const indicator = indicators.value.find((i) => i.id === indicatorId);

    if (!indicator) return 0;

    let score = 0;

    if (indicator.type === "manual") {
      score = value;
    } else {
      const [year, month] = period.split("-").map(Number);

      const periodValues = rawData.value
        .filter((r) => {
          if (!r.period || r.indicator_id !== indicatorId) return false;
          const date = new Date(r.period);
          const localDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
          const itemYear = localDate.getFullYear();
          const itemMonth = localDate.getMonth() + 1;
          return itemYear === year && itemMonth === month;
        })
        .map((r) => Number(r.value) || 0);

      const maxValue = Math.max(0, ...periodValues);

      if (maxValue > 0) {
        score = (value / maxValue) * indicator.max_weight;
      }
    }

    score = Number(score.toFixed(2));
    scoreCache.value.set(cacheKey, score);

    return score;
  }

  function getTotalScore(forestryId, period = currentPeriod.value) {
    try {
      let total = 0;
      indicators.value.forEach((indicator) => {
        total += getScore(forestryId, indicator.id, period);
      });
      return total.toFixed(2);
    } catch (error) {
      console.error("Ошибка расчета итога:", error);
      return "0.00";
    }
  }

  function getScoreClass(score) {
    if (score < 0) return "penalty";
    if (score > 0) return "positive";
    return "neutral";
  }

  watch(
    rawData,
    () => {
      scoreCache.value.clear();
    },
    { deep: true },
  );

  async function saveValue(
    forestryId,
    indicatorId,
    value,
    period = currentPeriod.value,
  ) {
    try {
      const [year, month] = period.split("-").map(Number);

      const localDate = new Date(year, month - 1, 1, 12, 0, 0);
      const periodDate = new Date(localDate.getTime() - 5 * 60 * 60 * 1000);

      const response = await api.saveRawData({
        forestry_id: forestryId,
        indicator_id: indicatorId,
        value: Number(value),
        period: periodDate.toISOString(),
      });

      const existingIndex = rawData.value.findIndex((r) => {
        if (!r.period) return false;

        const date = new Date(r.period);
        const localDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
        const itemYear = localDate.getFullYear();
        const itemMonth = localDate.getMonth() + 1;

        return (
          r.forestry_id === forestryId &&
          r.indicator_id === indicatorId &&
          itemYear === year &&
          itemMonth === month
        );
      });

      if (existingIndex >= 0) {
        rawData.value[existingIndex].value = Number(value);
        rawData.value[existingIndex].updated_at = new Date().toISOString();
        if (response?.id) {
          rawData.value[existingIndex].id = response.id;
        }
      } else {
        rawData.value.push({
          id: response?.id || Date.now(),
          forestry_id: forestryId,
          indicator_id: indicatorId,
          value: Number(value),
          period: periodDate.toISOString(),
          created_by: authStore.user?.id,
          updated_at: new Date().toISOString(),
        });
      }

      for (let key of scoreCache.value.keys()) {
        if (key.includes(`-${indicatorId}-`)) {
          scoreCache.value.delete(key);
        }
      }

      dataLoaded.value = true;
    } catch (error) {
      console.error("❌ Ошибка сохранения:", error);
      throw error;
    }
  }

  function setPeriod(period) {
    currentPeriod.value = period;
    dataLoaded.value = false;
  }

  return {
    forestries,
    sections,
    indicators,
    rawData,
    responsible,
    users,
    loading,
    currentPeriod,
    dataLoaded,
    getIndicatorsBySection,
    canEditIndicator,
    isUserResponsibleForIndicator,
    getValue,
    getScore,
    getTotalScore,
    getScoreClass,
    loadAllData,
    saveValue,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    setPeriod,
  };
});
