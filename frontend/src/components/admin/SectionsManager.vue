<template>
  <div class="sections-manager">
    <div class="manager-header">
      <h3>📁 Управление разделами</h3>
      <button @click="openForm()" class="btn-add">+ Новый раздел</button>
    </div>

    <div class="sections-list">
      <div v-for="section in sections" :key="section.id" class="section-card">
        <div class="section-info">
          <h4>{{ section.name }}</h4>
          <p>{{ section.description }}</p>
          <div class="section-meta">
            <span class="badge">Сортировка: {{ section.sort_order }}</span>
            <span class="badge"
              >Создан: {{ formatDate(section.created_at) }}</span
            >
          </div>
        </div>
        <div class="section-actions">
          <button
            @click="openForm(section)"
            class="btn-edit"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            @click="deleteSection(section.id)"
            class="btn-delete"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно для формы -->
    <Modal v-if="showForm" @close="closeForm">
      <SectionForm
        :section="editingSection"
        @save="saveSection"
        @cancel="closeForm"
      />
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../../lib/api"; // ← вместо supabase
import Modal from "../UI/Modal.vue";
import SectionForm from "./SectionForm.vue";

const sections = ref([]);
const showForm = ref(false);
const editingSection = ref(null);

const emit = defineEmits(["changed"]);

onMounted(() => {
  loadSections();
});

const loadSections = async () => {
  try {
    const data = await api.getSections(); // ← используем api
    sections.value = data || [];
  } catch (error) {
    console.error("Ошибка загрузки разделов:", error);
  }
};

const openForm = (section = null) => {
  editingSection.value = section;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingSection.value = null;
};

const saveSection = async (sectionData) => {
  try {
    if (editingSection.value) {
      await api.updateSection(editingSection.value.id, sectionData);
    } else {
      await api.createSection(sectionData);
    }
    closeForm();
    loadSections();
    emit("changed");
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    alert("Ошибка при сохранении раздела");
  }
};

const deleteSection = async (id) => {
  if (!confirm("Удалить раздел? Все показатели в разделе тоже будут удалены."))
    return;

  try {
    await api.deleteSection(id);
    loadSections();
    emit("changed");
  } catch (error) {
    console.error("Ошибка удаления:", error);
    alert("Ошибка при удалении раздела");
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("ru-RU");
};
</script>

<style scoped>
.sections-manager {
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.manager-header h3 {
  margin: 0;
  color: #333;
}

.btn-add {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover {
  background: #45a049;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.section-card:hover {
  background: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
}

.section-info p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.section-meta {
  display: flex;
  gap: 10px;
}

.badge {
  padding: 4px 8px;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-edit:hover {
  background: #1976d2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #d32f2f;
}
</style>
