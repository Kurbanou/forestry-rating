<template>
  <div class="quarterly-comparison">
    <h2>📊 Сравнение по кварталам</h2>

    <div class="controls">
      <div class="control-group">
        <label>Год:</label>
        <el-select
          v-model="selectedYear"
          @change="updateChart"
          style="width: 80px"
        >
          <el-option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </el-option>
        </el-select>
      </div>

      <div class="control-group">
        <label>Квартал:</label>
        <el-select
          v-model="selectedQuarter"
          @change="updateChart"
          style="width: 60px"
        >
          <el-option value="1"></el-option>
          <el-option value="2"></el-option>
          <el-option value="3"></el-option>
          <el-option value="4"></el-option>
        </el-select>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="comparisonChart"></canvas>
    </div>

    <div class="stats-summary" v-if="chartData.length">
      <div class="stat-card leader">
        <div class="stat-label">Лидер</div>
        <div class="stat-value">{{ topForestry.name }}</div>
        <div class="stat-score">{{ topForestry.value.toFixed(2) }} баллов</div>
      </div>
      <div class="stat-card average">
        <div class="stat-label">Средний балл</div>
        <div class="stat-value">{{ averageScore.toFixed(2) }}</div>
      </div>
      <div class="stat-card outsider">
        <div class="stat-label">Аутсайдер</div>
        <div class="stat-value">{{ bottomForestry.name }}</div>
        <div class="stat-score">
          {{ bottomForestry.value.toFixed(2) }} баллов
        </div>
      </div>
    </div>

    <div v-if="!chartData.length" class="no-data">
      Нет данных за выбранный период
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

// Доступные годы из всех данных
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

// Получить средний балл за квартал для лесничества
const getQuarterAverage = (forestryId, year, quarter) => {
  const months = getQuarterMonths(quarter);
  let totalScore = 0;
  let monthsWithData = 0;

  months.forEach((month) => {
    const period = `${year}-${String(month).padStart(2, "0")}`;
    let forestryTotal = 0;
    let hasData = false;

    // Суммируем все показатели за месяц
    dataStore.indicators.forEach((indicator) => {
      const score = dataStore.getScore(forestryId, indicator.id, period);
      if (score !== 0) {
        forestryTotal += score;
        hasData = true;
      }
    });

    if (hasData) {
      totalScore += forestryTotal;
      monthsWithData++;
    }
  });

  return monthsWithData > 0 ? totalScore / monthsWithData : 0;
};

// Данные для графика
const chartData = computed(() => {
  return dataStore.forestries
    .map((forestry) => ({
      forestryId: forestry.id,
      name: forestry.name,
      value: getQuarterAverage(
        forestry.id,
        selectedYear.value,
        selectedQuarter.value,
      ),
    }))
    .filter((item) => item.value > 0); // Показываем только лесничества с данными
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

  // Сортируем по убыванию
  const sortedData = [...chartData.value].sort((a, b) => b.value - a.value);

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedData.map((item) => item.name),
      datasets: [
        {
          label: `Средний балл за ${selectedQuarter.value} квартал ${selectedYear.value}`,
          data: sortedData.map((item) => Number(item.value.toFixed(2))),
          backgroundColor: sortedData.map((item, index) => {
            if (index === 0) return "#4caf50"; // Лидер - зеленый
            if (index === sortedData.length - 1) return "#f44336"; // Аутсайдер - красный
            return "#2196f3"; // Остальные - синий
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
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw} баллов`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Баллы" },
        },
      },
    },
  });
};

// Следим за изменениями
watch([selectedYear, selectedQuarter], () => {
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
.quarterly-comparison {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quarterly-comparison h2 {
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

.chart-container {
  height: 400px;
  position: relative;
  margin-bottom: 30px;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-card.leader {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.stat-card.average {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.stat-card.outsider {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-score {
  font-size: 24px;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 60px;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
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

  .stats-summary {
    grid-template-columns: 1fr;
  }
}
</style>
