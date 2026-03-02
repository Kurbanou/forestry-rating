<template>
  <div class="quarterly-comparison">
    <h3>📊 Сравнение лесничеств по кварталам</h3>

    <div class="controls">
      <div class="control-group">
        <label>Год:</label>
        <select v-model="selectedYear" @change="updateChart">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label>Квартал:</label>
        <select v-model="selectedQuarter" @change="updateChart">
          <option value="1">1 квартал (Янв-Март)</option>
          <option value="2">2 квартал (Апр-Июнь)</option>
          <option value="3">3 квартал (Июль-Сент)</option>
          <option value="4">4 квартал (Окт-Дек)</option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="comparisonChart"></canvas>
    </div>

    <div class="stats-summary" v-if="chartData.length">
      <div class="stat-card">
        <strong>Лидер квартала:</strong>
        <span :style="{ color: '#4caf50' }">
          {{ topForestry.name }} — {{ topForestry.value.toFixed(2) }} баллов
        </span>
      </div>
      <div class="stat-card">
        <strong>Аутсайдер:</strong>
        <span :style="{ color: '#f44336' }">
          {{ bottomForestry.name }} —
          {{ bottomForestry.value.toFixed(2) }} баллов
        </span>
      </div>
      <div class="stat-card">
        <strong>Средний балл:</strong>
        <span>{{ averageScore.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useDataStore } from "../stores/dataStore";
import Chart from "chart.js/auto";

const dataStore = useDataStore();
const comparisonChart = ref(null);
let chart = null;

const selectedYear = ref(new Date().getFullYear());
const selectedQuarter = ref("1");

// Доступные годы из данных
const availableYears = computed(() => {
  const years = new Set();
  dataStore.rawData.forEach((item) => {
    if (item.period) {
      const date = new Date(item.period);
      // Учитываем смещение часового пояса
      const localDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
      years.add(localDate.getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a); // по убыванию
});

// Получить месяцы квартала
const getQuarterMonths = (quarter) => {
  switch (quarter) {
    case "1":
      return [1, 2, 3];
    case "2":
      return [4, 5, 6];
    case "3":
      return [7, 8, 9];
    case "4":
      return [10, 11, 12];
    default:
      return [1, 2, 3];
  }
};

// Получить рейтинг лесничества за конкретный месяц
const getRatingForMonth = (forestryId, year, month) => {
  const period = `${year}-${String(month).padStart(2, "0")}`;
  let total = 0;

  dataStore.indicators.forEach((indicator) => {
    total += dataStore.getScore(forestryId, indicator.id, period);
  });

  return total;
};

// Данные для графика (среднее за квартал)
const chartData = computed(() => {
  const months = getQuarterMonths(selectedQuarter.value);

  return dataStore.forestries.map((forestry) => {
    let totalScore = 0;
    let monthsWithData = 0;

    months.forEach((month) => {
      const score = getRatingForMonth(forestry.id, selectedYear.value, month);
      if (score !== 0) {
        totalScore += score;
        monthsWithData++;
      }
    });

    // Среднее за квартал (если есть данные)
    const avgScore = monthsWithData > 0 ? totalScore / monthsWithData : 0;

    return {
      forestryId: forestry.id,
      name: forestry.name,
      value: avgScore,
    };
  });
});

// Топ и аутсайдер
const topForestry = computed(() => {
  if (!chartData.value.length) return { name: "-", value: 0 };
  return chartData.value.reduce((max, item) =>
    item.value > max.value ? item : max,
  );
});

const bottomForestry = computed(() => {
  if (!chartData.value.length) return { name: "-", value: 0 };
  return chartData.value.reduce((min, item) =>
    item.value < min.value ? item : min,
  );
});

const averageScore = computed(() => {
  if (!chartData.value.length) return 0;
  const sum = chartData.value.reduce((acc, item) => acc + item.value, 0);
  return sum / chartData.value.length;
});

// Обновление графика
const updateChart = () => {
  if (!comparisonChart.value) return;

  if (chart) {
    chart.destroy();
  }

  const ctx = comparisonChart.value.getContext("2d");

  // Сортируем лесничества по убыванию баллов
  const sortedData = [...chartData.value].sort((a, b) => b.value - a.value);

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedData.map((item) => item.name),
      datasets: [
        {
          label: `Средний балл за ${selectedQuarter.value} квартал ${selectedYear.value}`,
          data: sortedData.map((item) => item.value.toFixed(2)),
          backgroundColor: sortedData.map((item, index) => {
            if (index === 0) return "#4caf50"; // лидер - зеленый
            if (index === sortedData.length - 1) return "#f44336"; // аутсайдер - красный
            return "#2196f3"; // остальные - синий
          }),
          borderColor: "#fff",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.raw} баллов`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Баллы",
          },
          grid: {
            color: "#f0f0f0",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
};

// Следим за изменениями
watch([selectedYear, selectedQuarter], updateChart);

onMounted(() => {
  updateChart();
});
</script>

<style scoped>
.quarterly-comparison {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quarterly-comparison h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.2rem;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: 500;
  color: #555;
}

.control-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.control-group select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.chart-container {
  height: 400px;
  position: relative;
  margin-bottom: 30px;
}

.stats-summary {
  display: flex;
  gap: 20px;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-card {
  text-align: center;
  padding: 10px 20px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.stat-card strong {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

.stat-card span {
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 10px;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-group select {
    width: 100%;
  }

  .stats-summary {
    flex-direction: column;
  }

  .stat-card {
    width: 100%;
  }
}
</style>
