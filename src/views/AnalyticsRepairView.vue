<template>
  <div class="p-6 space-y-6 relative">
    <!-- Поиск -->
    <div class="flex justify-between items-center flex-col sm:flex-row gap-3 sm:gap-0">
      <h1 class="text-2xl font-bold">Техника в ремонте (заявки)</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Поиск по заявке, пользователю или технике..."
        class="border rounded-xl px-4 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>

    <!-- Таблица заявок на ремонт -->
    <div class="bg-white rounded-xl shadow p-2 sm:p-4">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="px-2 sm:px-3 py-2 text-left">ID</th>
              <th class="px-2 sm:px-3 py-2 text-left">Пользователь</th>
              <th class="px-2 sm:px-3 py-2 text-left">Техника</th>
              <th
                class="px-2 sm:px-3 py-2 text-left"
                :class="{ 'hidden sm:table-cell': hideColumns.includes('comment') }"
              >
                Комментарий
              </th>
              <th
                class="px-2 sm:px-3 py-2 text-left"
                :class="{ 'hidden md:table-cell': hideColumns.includes('status') }"
              >
                Статус
              </th>
              <th
                class="px-2 sm:px-3 py-2 text-left"
                :class="{ 'hidden md:table-cell': hideColumns.includes('date') }"
              >
                Дата
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="req in filteredRequests"
              :key="req.id"
              class="border-b hover:bg-gray-50 cursor-pointer"
              @click="goToRequestDetail(req.id)"
            >
              <td class="px-2 sm:px-3 py-2">{{ req.id }}</td>
              <td class="px-2 sm:px-3 py-2">
                <div class="flex items-center gap-2 min-w-0">
                  <img
                    v-if="req.user?.avatar_path"
                    :src="req.user.avatar_path"
                    alt="avatar"
                    class="w-8 h-8 rounded-full object-cover border"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-base border"
                  >
                    <i class="ri-user-3-line"></i>
                  </div>
                  <span class="truncate">{{
                    req.user?.fullName || req.user?.name || req.user?.email || '-'
                  }}</span>
                </div>
              </td>
              <td class="px-2 sm:px-3 py-2 min-w-[120px]">
                <div
                  v-for="asset in req.assets"
                  :key="asset.id"
                  class="flex items-center gap-2 mb-1 min-w-0"
                >
                  <img
                    v-if="asset.photo"
                    :src="asset.photo"
                    alt=""
                    class="w-8 h-8 rounded object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400"
                  >
                    <i class="ri-image-line text-base"></i>
                  </div>
                  <span class="truncate">
                    {{ asset.inv_number }}<span v-if="asset.name">, {{ asset.name }}</span>
                  </span>
                </div>
              </td>
              <td
                class="px-2 sm:px-3 py-2"
                :class="{ 'hidden sm:table-cell': hideColumns.includes('comment') }"
              >
                <span class="break-words">{{ req.comment }}</span>
              </td>
              <td
                class="px-2 sm:px-3 py-2"
                :class="{ 'hidden md:table-cell': hideColumns.includes('status') }"
              >
                <span v-if="req.status === 'in_progress'" class="text-blue-600">В процессе</span>
                <span v-else>{{ req.status }}</span>
              </td>
              <td
                class="px-2 sm:px-3 py-2"
                :class="{ 'hidden md:table-cell': hideColumns.includes('date') }"
              >
                {{ formatDate(req.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="requests.length === 0" class="text-center text-gray-400 py-6">Нет заявок</div>
      </div>
    </div>

    <!-- Кнопка сброса фильтров -->
    <button
      v-if="search || Object.keys(filters || {}).some((k) => filters[k])"
      @click="resetFilters"
      class="fixed left-8 bottom-8 z-50 bg-white border border-gray-300 shadow-lg px-5 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
      style="min-width: 160px"
    >
      <i class="ri-filter-off-line mr-2"></i> Сбросить фильтры
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const search = ref('')
const requests = ref([])
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
  axios
    .get('http://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    .then(() => {
      const token = localStorage.getItem('token')
      return axios.get('/api/asset-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1] || ''),
        },
        withCredentials: true,
      })
    })
    .then((response) => {
      requests.value = (response.data.data || response.data).filter(
        (req) => req.operation === 'repair' && req.status === 'in_progress',
      )
    })
    .catch(() => {
      requests.value = []
    })
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function goToRequestDetail(requestId) {
  router.push(`/asset-requests/${requestId}`)
}

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

const filteredRequests = computed(() => {
  if (!search.value.trim()) return requests.value
  const query = search.value.toLowerCase()
  return requests.value.filter((req) => {
    const userStr = (req.user?.fullName || '') + (req.user?.name || '') + (req.user?.email || '')
    const assetsStr = (req.assets || [])
      .map((a) => [a.inv_number, a.name, a.type, a.brand].join(' '))
      .join(' ')
    return (
      req.id.toString().includes(query) ||
      userStr.toLowerCase().includes(query) ||
      assetsStr.toLowerCase().includes(query) ||
      (req.comment || '').toLowerCase().includes(query)
    )
  })
})

const hideColumns = computed(() => {
  if (windowWidth.value < 640) {
    return ['comment', 'status', 'date']
  }
  if (windowWidth.value < 768) {
    return ['status', 'date']
  }
  return []
})
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
