<template>
  <div class="p-2 sm:p-6">
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 grid-rows-6 gap-2 sm:gap-4 min-h-[600px] sm:h-[800px]"
    >
      <!-- Всего техники -->
      <component
        :is="loading ? 'div' : 'router-link'"
        to="/analytics/items"
        class="relative row-span-2 col-span-1 sm:col-span-2 lg:col-span-4 text-white rounded-2xl overflow-hidden bg-cover bg-center group cursor-pointer min-h-[120px]"
        :class="loading ? 'bg-gray-200 animate-pulse' : 'bg-[url(/images/notebook.jpg)]'"
      >
        <template v-if="!loading">
          <div
            class="absolute inset-0 bg-black/30 group-hover:backdrop-blur-sm transition duration-300"
          ></div>
          <div
            class="relative z-10 p-2 sm:p-4 origin-top-left group-hover:scale-105 transition-transform duration-300"
          >
            <div class="text-base sm:text-xl drop-shadow">Всего техники</div>
            <div class="text-2xl sm:text-4xl font-bold drop-shadow">{{ stats.total }}</div>
          </div>
        </template>
      </component>
      <!-- В ремонте -->
      <component
        :is="loading ? 'div' : 'router-link'"
        to="/analytics/repair"
        class="relative row-span-2 sm:row-span-3 text-white rounded-2xl overflow-hidden bg-cover bg-center group min-h-[120px]"
        :class="loading ? 'bg-gray-200 animate-pulse' : 'bg-[url(/images/office.jpg)]'"
      >
        <template v-if="!loading">
          <div
            class="absolute inset-0 bg-black/30 group-hover:backdrop-blur-sm transition duration-300"
          ></div>
          <div
            class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10 origin-bottom-left group-hover:scale-105 transition-transform duration-300"
          >
            <div class="text-sm sm:text-lg drop-shadow">В ремонте</div>
            <div class="text-sm sm:text-lg font-bold drop-shadow">
              {{ stats.repair_requests_in_progress ?? stats.in_repair }}
            </div>
          </div>
        </template>
      </component>
      <!-- Заявки (pending) -->
      <component
        :is="loading ? 'div' : 'router-link'"
        to="/requests/actual"
        class="relative row-span-2 sm:row-span-6 text-white rounded-2xl overflow-hidden bg-cover bg-center group min-h-[120px]"
        :class="loading ? 'bg-gray-200 animate-pulse' : 'bg-[url(/images/notebook_2.jpg)]'"
      >
        <template v-if="!loading">
          <div
            class="absolute inset-0 bg-black/30 group-hover:backdrop-blur-sm transition duration-300"
          ></div>
          <div
            class="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 origin-top-right group-hover:scale-105 transition-transform duration-300 text-right"
          >
            <div class="text-base sm:text-xl drop-shadow">Заявки</div>
            <div class="text-base sm:text-xl font-bold drop-shadow">
              {{ isAdmin ? stats.requests_count : stats.user_requests_count }}
            </div>
          </div>
        </template>
      </component>
      <!-- История заявок (approved/rejected) -->
      <component
        :is="loading ? 'div' : 'router-link'"
        to="/requests/history"
        class="relative row-span-2 sm:row-span-4 col-span-1 sm:col-span-2 lg:col-span-3 text-white rounded-2xl overflow-hidden bg-cover bg-center group min-h-[120px]"
        :class="loading ? 'bg-gray-200 animate-pulse' : 'bg-[url(/images/notebook_3.jpg)]'"
      >
        <template v-if="!loading">
          <div
            class="absolute inset-0 bg-black/30 group-hover:backdrop-blur-sm transition duration-300"
          ></div>
          <div
            class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10 origin-bottom-left group-hover:scale-105 transition-transform duration-300"
          >
            <div class="text-base sm:text-xl drop-shadow">История заявок</div>
            <div class="text-2xl sm:text-4xl font-bold drop-shadow">
              {{ isAdmin ? stats.requests_history_count : stats.user_requests_history_count }}
            </div>
          </div>
        </template>
      </component>
      <!-- Свободная техника -->
      <component
        :is="loading ? 'div' : 'router-link'"
        to="/analytics/free-assets"
        class="relative row-span-2 sm:row-span-4 text-white rounded-2xl overflow-hidden bg-cover bg-center group min-h-[120px]"
        :class="loading ? 'bg-gray-200 animate-pulse' : 'bg-[url(/images/notebook_3.jpg)]'"
      >
        <template v-if="!loading">
          <div
            class="absolute inset-0 bg-black/30 group-hover:backdrop-blur-sm transition duration-300"
          ></div>
          <div
            class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-10 origin-bottom-left group-hover:scale-105 transition-transform duration-300"
          >
            <div class="text-base sm:text-xl drop-shadow">Свободная техника</div>
            <div class="text-2xl sm:text-4xl font-bold drop-shadow">
              {{ stats.free_assets_count ?? stats.free_count ?? 0 }}
            </div>
          </div>
        </template>
      </component>
      <!-- Последние операции -->
      <component
        :is="loading ? 'div' : 'router-link'"
        to="/analytics/reserve"
        class="relative row-span-2 sm:row-span-3 text-white rounded-2xl overflow-hidden bg-cover bg-center group min-h-[120px]"
        :class="loading ? 'bg-gray-200 animate-pulse' : 'bg-[url(/images/office_2.jpg)]'"
      >
        <template v-if="!loading">
          <div
            class="absolute inset-0 bg-black/30 group-hover:backdrop-blur-sm transition duration-300"
          ></div>
          <div
            class="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10 origin-bottom-right group-hover:scale-105 transition-transform duration-300 text-right"
          >
            <div class="text-sm sm:text-lg drop-shadow">Лог операций</div>
            <div class="text-sm sm:text-lg font-bold drop-shadow">{{ stats.logs_count }}</div>
          </div>
        </template>
      </component>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Cookies from 'js-cookie'

const stats = ref({
  total: 0,
  in_repair: 0,
  awaiting_update: 0,
  total_cost: 0,
  logs_count: 0,
  requests_count: 0,
  requests_total: 0,
  requests_history_count: 0,
  user_requests_count: 0,
  user_requests_history_count: 0,
})

const isAdmin = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    // Получаем текущего пользователя
    await axios.get('https://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    const userResp = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    isAdmin.value = userResp.data.role === 'admin'
    // Получаем статистику
    const response = await axios.get('/api/analytics/summary', {
      headers: { 'X-XSRF-TOKEN': decodeURIComponent(token) },
      withCredentials: true,
    })
    stats.value = {
      ...response.data.stats,
      requests_count: response.data.stats.requests_count ?? 0,
      requests_total: response.data.stats.requests_total ?? 0,
      requests_history_count: response.data.stats.requests_history_count ?? 0,
      user_requests_count:
        response.data.stats.user_requests_count ?? response.data.stats.requests_count ?? 0,
      user_requests_history_count:
        response.data.stats.user_requests_history_count ??
        response.data.stats.requests_history_count ??
        0,
    }
    // --- сделать функцию обновления статистики глобальной ---
    window.fetchAnalyticsStats = async () => {
      try {
        const token = Cookies.get('XSRF-TOKEN')
        const resp = await axios.get('/api/analytics/summary', {
          headers: { 'X-XSRF-TOKEN': decodeURIComponent(token) },
          withCredentials: true,
        })
        stats.value = {
          ...resp.data.stats,
          requests_count: resp.data.stats.requests_count ?? 0,
          requests_total: resp.data.stats.requests_total ?? 0,
          requests_history_count: resp.data.stats.requests_history_count ?? 0,
          user_requests_count:
            resp.data.stats.user_requests_count ?? resp.data.stats.requests_count ?? 0,
          user_requests_history_count:
            resp.data.stats.user_requests_history_count ??
            resp.data.stats.requests_history_count ??
            0,
        }
      } catch (e) {
        // ignore
      }
    }
    // --- конец добавленного ---
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
  } finally {
    loading.value = false
  }
})
</script>
