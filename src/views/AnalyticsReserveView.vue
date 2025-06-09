<template>
  <div class="p-6 space-y-6 relative">
    <!-- Поиск -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Лог операций</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Поиск по действию, пользователю или технике..."
        class="border rounded-xl px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>

    <!-- Список логов -->
    <div class="bg-white rounded-xl shadow p-4">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="px-3 py-2 text-left">Дата</th>
              <th class="px-3 py-2 text-left">Пользователь</th>
              <th class="px-3 py-2 text-left">Техника</th>
              <th class="px-3 py-2 text-left">Действие</th>
              <th class="px-3 py-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="border-b hover:bg-gray-50">
              <td class="px-3 py-2 whitespace-nowrap">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                {{ log.user?.name || '-' }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                {{ log.asset?.name || '-' }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                {{ log.action }}
              </td>
              <td class="px-3 py-2">
                {{ log.description }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="logs.length === 0" class="text-center text-gray-400 py-6">Нет данных</div>
      </div>
      <!-- Пагинация -->
      <div class="flex justify-end mt-4" v-if="pagination.total > pagination.per_page">
        <button
          class="px-3 py-1 rounded bg-gray-200 mx-1"
          :disabled="pagination.current_page === 1"
          @click="fetchLogs(pagination.current_page - 1)"
        >
          Назад
        </button>
        <span class="px-2 py-1">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <button
          class="px-3 py-1 rounded bg-gray-200 mx-1"
          :disabled="pagination.current_page === pagination.last_page"
          @click="fetchLogs(pagination.current_page + 1)"
        >
          Вперёд
        </button>
      </div>
    </div>

    <!-- Кнопка сброса фильтров -->
    <button
      v-if="search"
      @click="resetFilters"
      class="fixed left-8 bottom-8 z-50 bg-white border border-gray-300 shadow-lg px-5 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
      style="min-width: 160px"
    >
      <i class="ri-filter-off-line mr-2"></i> Сбросить фильтры
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import axios from 'axios'

const logs = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})
const search = ref('')

const filtersState = inject('filtersState', ref({}))

watch(
  search,
  () => {
    filtersState.value = { search: search.value }
  },
  { immediate: true },
)

watch(filtersState, (val) => {
  if (Object.keys(val).length === 0) {
    search.value = ''
    // fetchLogs(1) если нужно обновить данные
  }
})

const fetchLogs = async (page = 1) => {
  try {
    const response = await axios.get('/api/asset-logs', {
      params: { page },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    logs.value = response.data.data
    pagination.value = {
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      per_page: response.data.per_page,
      total: response.data.total,
    }
  } catch (error) {
    console.error('Ошибка при загрузке логов:', error)
    logs.value = []
  }
}

onMounted(() => {
  fetchLogs()
})

const filteredLogs = computed(() => {
  if (!search.value.trim()) return logs.value
  const query = search.value.toLowerCase()
  return logs.value.filter(
    (log) =>
      (log.user?.name && log.user.name.toLowerCase().includes(query)) ||
      (log.asset?.name && log.asset.name.toLowerCase().includes(query)) ||
      (log.action && log.action.toLowerCase().includes(query)) ||
      (log.description && log.description.toLowerCase().includes(query)),
  )
})

function formatDate(val) {
  if (!val) return ''
  const date = new Date(val)
  if (isNaN(date)) return val
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function resetFilters() {
  search.value = ''
  // Можно вызвать fetchLogs(1), если требуется обновить данные
  // fetchLogs(1)
}
</script>

<style scoped>
/* Анимация появления таблиц */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Анимация наведения на строки */
.grid-cols-6:hover {
  transition: all 0.3s ease;
}
</style>
