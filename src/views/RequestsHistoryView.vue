<template>
  <div class="p-6 space-y-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h1 class="text-3xl font-bold mb-1 text-gray-900">История заявок</h1>
        <div class="text-gray-500 text-base">
          Здесь отображаются все принятые и одобренные заявки на операции с техникой
        </div>
      </div>
      <div class="mt-2 md:mt-0 md:ml-8">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по id, пользователю, операции, инв. номеру, кому передано, статусу..."
          class="border rounded-xl px-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-4">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="px-3 py-2 text-left">ID</th>
              <th class="px-3 py-2 text-left">Пользователь</th>
              <th class="px-3 py-2 text-left">Операция</th>
              <th class="px-3 py-2 text-left">Детали операции</th>
              <th class="px-3 py-2 text-left">Комментарий</th>
              <th class="px-3 py-2 text-left">Статус</th>
              <th class="px-3 py-2 text-left">Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="req in filteredRequests"
              :key="req.id"
              class="border-b hover:bg-gray-50 cursor-pointer"
              @click="goToRequestDetail(req.id)"
            >
              <td class="px-3 py-2">{{ req.id }}</td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-2">
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
                  <span>{{ req.user?.fullName || req.user?.name || req.user?.email || '-' }}</span>
                </div>
              </td>
              <td class="px-3 py-2">
                <span v-if="req.operation === 'repair'">Ремонт</span>
                <span v-else-if="req.operation === 'change'">Сменить</span>
                <span v-else-if="req.operation === 'transfer'">Передать</span>
                <span v-else-if="req.operation === 'error'">Сообщить об ошибке</span>
                <span v-else>{{ req.operation }}</span>
              </td>
              <td class="px-3 py-2">
                <!-- Детали операции -->
                <template v-if="req.operation === 'change'">
                  <div>
                    <span class="font-semibold">Было:</span>
                    <span v-for="asset in req.assets_before" :key="asset.id" class="ml-1">
                      {{ asset.inv_number }}<span v-if="asset.name">, {{ asset.name }}</span>
                    </span>
                  </div>
                  <div>
                    <span class="font-semibold">Стало:</span>
                    <span v-for="asset in req.assets_after" :key="asset.id" class="ml-1">
                      {{ asset.inv_number }}<span v-if="asset.name">, {{ asset.name }}</span>
                    </span>
                  </div>
                </template>
                <template v-else-if="req.operation === 'repair'">
                  <div>
                    <span class="font-semibold">Поставлено на ремонт:</span>
                    <span>{{ formatDate(req.repair_started_at) }}</span>
                  </div>
                  <div>
                    <span class="font-semibold">Завершено:</span>
                    <span>{{ formatDate(req.repair_completed_at) }}</span>
                  </div>
                </template>
                <template v-else-if="req.operation === 'transfer'">
                  <div>
                    <span class="font-semibold">От кого:</span>
                    <span>{{
                      req.user?.fullName || req.user?.name || req.user?.email || '-'
                    }}</span>
                  </div>
                  <div>
                    <span class="font-semibold">Кому:</span>
                    <span>{{
                      req.user_transfer?.fullName ||
                      req.user_transfer?.name ||
                      req.user_transfer?.email ||
                      '-'
                    }}</span>
                  </div>
                  <div>
                    <span class="font-semibold">Техника:</span>
                    <span v-for="asset in req.assets" :key="asset.id" class="ml-1">
                      {{ asset.inv_number }}<span v-if="asset.name">, {{ asset.name }}</span>
                    </span>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-for="asset in req.assets"
                    :key="asset.id"
                    class="flex items-center gap-2 mb-1"
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
                    <span>
                      {{ asset.inv_number }}<span v-if="asset.name">, {{ asset.name }}</span>
                    </span>
                  </div>
                </template>
              </td>
              <td class="px-3 py-2">{{ req.comment }}</td>
              <td class="px-3 py-2">
                <span v-if="req.status === 'pending'" class="text-yellow-600">В обработке</span>
                <span v-else-if="req.status === 'approved'" class="text-green-600">Одобрено</span>
                <span v-else-if="req.status === 'rejected'" class="text-red-600">Отклонено</span>
                <span v-else>{{ req.status }}</span>
              </td>
              <td class="px-3 py-2">{{ formatDate(req.created_at) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="requests.length === 0" class="text-center text-gray-400 py-6">Нет заявок</div>
      </div>
      <!-- Пагинация -->
      <div class="flex justify-end mt-4" v-if="pagination.total > pagination.per_page">
        <button
          class="px-3 py-1 rounded bg-gray-200 mx-1"
          :disabled="pagination.current_page === 1"
          @click="fetchRequests(pagination.current_page - 1)"
        >
          Назад
        </button>
        <span class="px-2 py-1">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <button
          class="px-3 py-1 rounded bg-gray-200 mx-1"
          :disabled="pagination.current_page === pagination.last_page"
          @click="fetchRequests(pagination.current_page + 1)"
        >
          Вперёд
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Cookies from 'js-cookie'
import BaseModal from '@/components/BaseModal.vue'
import { nextTick } from 'vue'

const requests = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0,
})
const search = ref('')
const router = useRouter()
const currentUser = ref(null)
const isAdmin = ref(false)

async function fetchCurrentUser() {
  try {
    const resp = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    currentUser.value = resp.data
    isAdmin.value = resp.data.role === 'admin'
  } catch (e) {
    currentUser.value = null
    isAdmin.value = false
  }
}

async function fetchRequests(page = 1) {
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    const response = await axios.get('/api/asset-requests', {
      params: { page },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'X-XSRF-TOKEN': decodeURIComponent(token),
      },
      withCredentials: true,
    })
    let all = Array.isArray(response.data.data) ? response.data.data : response.data
    // Фильтрация: если не админ, показывать только свои заявки
    if (!isAdmin.value && currentUser.value?.id) {
      all = all.filter(
        (req) =>
          (req.status === 'approved' || req.status === 'rejected') &&
          req.created_by === currentUser.value.id,
      )
    } else {
      all = all.filter((req) => req.status === 'approved' || req.status === 'rejected')
    }
    requests.value = all
    pagination.value = {
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
      per_page: response.data.per_page || 20,
      total: response.data.total || requests.value.length,
    }
  } catch (error) {
    requests.value = []
    pagination.value = {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    }
  }
}

onMounted(async () => {
  await fetchCurrentUser()
  await fetchRequests()
})

watch(search, () => fetchRequests(1))

const filteredRequests = computed(() => {
  if (!search.value.trim()) return requests.value
  const query = search.value.toLowerCase()
  return requests.value.filter((req) => {
    // Поиск по id
    if (req.id && req.id.toString().includes(query)) return true
    // Поиск по пользователю (от кого заявка)
    const userStr = (req.user?.fullName || '') + (req.user?.name || '') + (req.user?.email || '')
    if (userStr.toLowerCase().includes(query)) return true
    // Поиск по операции
    if (
      (req.operation === 'repair' && 'ремонт'.includes(query)) ||
      (req.operation === 'change' && 'сменить'.includes(query)) ||
      (req.operation === 'transfer' && 'передать'.includes(query)) ||
      (req.operation === 'error' && 'ошибка'.includes(query)) ||
      (req.operation && req.operation.toLowerCase().includes(query))
    )
      return true
    // Поиск по инв. номеру техники в заявке
    if (
      (req.assets || []).some(
        (a) =>
          (a.inv_number && a.inv_number.toLowerCase().includes(query)) ||
          (a.name && a.name.toLowerCase().includes(query)),
      )
    )
      return true
    // Поиск по кому передано
    if (
      req.user_transfer &&
      (
        (req.user_transfer.fullName || '') +
        (req.user_transfer.name || '') +
        (req.user_transfer.email || '')
      )
        .toLowerCase()
        .includes(query)
    )
      return true
    // Поиск по статусу
    if (
      (req.status === 'pending' && 'в обработке'.includes(query)) ||
      (req.status === 'approved' && 'одобрено'.includes(query)) ||
      (req.status === 'rejected' && 'отклонено'.includes(query)) ||
      (req.status && req.status.toLowerCase().includes(query))
    )
      return true
    return false
  })
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

function goToRequestDetail(requestId) {
  router.push(`/asset-requests/${requestId}`)
}
</script>
