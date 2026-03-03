<template>
  <div class="trend-chart">
    <h2>📈 Динамика рейтинга по месяцам</h2>

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
        <label>Показать:</label>
        <select v-model="selectedForestry" @change="updateChart">
          <option value="all">Все лесничества</option>
          <option
            v-for="forestry in forestries"
            :key="forestry.id"
            :value="forestry.id"
          >
            {{ forestry.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="trendChart"></canvas>
    </div>

    <!-- Легенда - правильный вариант -->
    <div class="chart-legend" v-if="selectedForestry === 'all'">
      <div
        v-for="(forestry, index) in forestries"
        :key="forestry.id"
        class="legend-item"
      >
        <span
          class="color-box"
          :style="{ backgroundColor: colors[index % colors.length] }"
        ></span>
        <span>{{ forestry.name }}</span>
      </div>
    </div>

    <!-- Таблица с данными по месяцам -->
    <div class="monthly-data">
      <h3>Детальные данные по месяцам</h3>
      <table>
        <thead>
          <tr>
            <th>Лесничество</th>
            <th v-for="month in 12" :key="month">{{ getMonthName(month) }}</th>
            <th>Среднее</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="forestry in forestries" :key="forestry.id">
            <td class="forestry-name">{{ forestry.name }}</td>
            <td
              v-for="month in 12"
              :key="month"
              :class="getScoreClass(getMonthlyScore(forestry.id, month))"
            >
              {{ getMonthlyScore(forestry.id, month).toFixed(1) }}
            </td>
            <td class="average-cell">
              {{ getYearAverage(forestry.id).toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useDataStore } from "../stores/dataStore";
import Chart from "chart.js/auto";

const dataStore = useDataStore();
const trendChart = ref(null);
let chart = null;

const selectedYear = ref(new Date().getFullYear());
const selectedForestry = ref("all");

// Цвета для линий
const colors = [
  "#4caf50",
  "#2196f3",
  "#ff9800",
  "#e91e63",
  "#9c27b0",
  "#00bcd4",
  "#ff5722",
  "#8bc34a",
  "#ffc107",
  "#3f51b5",
  "#f44336",
  "#009688",
];

// Доступные годы
const availableYears = computed(() => {
  const years = new Set();
  dataStore.rawData.forEach((item) => {
    if (item.period) {
      const date = new Date(item.period);
      const localDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
      years.add(localDate.getFullYear());
    }
  });
  return Array.from(years).sort((a, b) => b - a);
});

const forestries = computed(() => dataStore.forestries);

// Получить баллы за конкретный месяц
const getMonthlyScore = (forestryId, month) => {
  const period = `${selectedYear.value}-${String(month).padStart(2, "0")}`;
  let total = 0;

  dataStore.indicators.forEach((indicator) => {
    total += dataStore.getScore(forestryId, indicator.id, period);
  });

  return total;
};

// Среднее за год
const getYearAverage = (forestryId) => {
  let total = 0;
  let monthsWithData = 0;

  for (let month = 1; month <= 12; month++) {
    const score = getMonthlyScore(forestryId, month);
    if (score > 0) {
      total += score;
      monthsWithData++;
    }
  }

  return monthsWithData > 0 ? total / monthsWithData : 0;
};

// Данные для графика
const chartData = computed(() => {
  const months = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];

  if (selectedForestry.value !== "all") {
    // График для одного лесничества
    const forestry = forestries.value.find(
      (f) => f.id === selectedForestry.value,
    );
    const data = [];

    for (let month = 1; month <= 12; month++) {
      data.push(getMonthlyScore(selectedForestry.value, month));
    }

    return {
      labels: months,
      datasets: [
        {
          label: forestry?.name || "Лесничество",
          data,
          borderColor: "#2196f3",
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderWidth: 3,
          tension: 0.1,
          fill: true,
        },
      ],
    };
  } else {
    // График для всех лесничеств
    const datasets = forestries.value.map((forestry, index) => {
      const data = [];
      for (let month = 1; month <= 12; month++) {
        data.push(getMonthlyScore(forestry.id, month));
      }

      return {
        label: forestry.name,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      };
    });

    return {
      labels: months,
      datasets,
    };
  }
});

// Класс для цвета ячейки
const getScoreClass = (score) => {
  if (score > 80) return "score-high";
  if (score > 60) return "score-medium-high";
  if (score > 40) return "score-medium";
  if (score > 20) return "score-medium-low";
  if (score > 0) return "score-low";
  return "score-zero";
};

const getMonthName = (month) => {
  const months = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];
  return months[month - 1];
};

// Обновление графика
const updateChart = () => {
  if (!trendChart.value) return;

  if (chart) {
    chart.destroy();
  }

  const ctx = trendChart.value.getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          // display: selectedForestry.value === "all",
          // position: "top",
        },
        // tooltip: {
        //   callbacks: {
        //     label: (context) =>
        //       `${context.dataset.label}: ${context.raw.toFixed(2)} баллов`,
        //   },
        // },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Баллы",
          },
        },
      },
    },
  });
};

// Следим за изменениями
watch([selectedYear, selectedForestry], () => {
  updateChart();
});

watch(
  () => dataStore.rawData,
  () => {
    updateChart();
  },
  { deep: true },
);

onMounted(() => {
  updateChart();
});
</script>

<style scoped>
.trend-chart {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.trend-chart h2 {
  margin: 0 0 20px 0;
  color: #333;
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
  min-width: 200px;
}

.control-group select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.chart-container {
  height: 400px;
  position: relative;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.monthly-data {
  margin-top: 30px;
  overflow-x: auto;
}

.monthly-data h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.monthly-data table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  font-size: 13px;
}

.monthly-data th {
  background: #f5f5f5;
  padding: 10px;
  text-align: center;
  border-bottom: 2px solid #ddd;
}

.monthly-data td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.forestry-name {
  font-weight: 500;
  background: #fafafa;
  text-align: left !important;
}

.average-cell {
  font-weight: bold;
  background: #e3f2fd;
  color: #1976d2;
}

.score-high {
  background: #c8e6c9;
  color: #2e7d32;
  font-weight: 500;
}

.score-medium-high {
  background: #dcedc8;
  color: #558b2f;
}

.score-medium {
  background: #fff9c4;
  color: #f57f17;
}

.score-medium-low {
  background: #ffe0b2;
  color: #bf360c;
}

.score-low {
  background: #ffcdd2;
  color: #b71c1c;
}

.score-zero {
  background: #f5f5f5;
  color: #999;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-group select {
    width: 100%;
  }

  .monthly-data {
    font-size: 11px;
  }
}
</style>
