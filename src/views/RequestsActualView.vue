<template>
  <div class="p-2 xs:p-3 sm:p-4 md:p-6 space-y-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h1 class="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">Заявки пользователей</h1>
        <div class="text-gray-500 text-base">Просмотр всех заявок на операции с техникой</div>
      </div>
      <div class="mt-2 md:mt-0 md:ml-8 w-full md:w-auto">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по заявке, пользователю или технике..."
          class="border rounded-xl px-4 py-2 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-2 xs:p-3 sm:p-4">
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b">
              <th class="px-2 sm:px-3 py-2 text-left">ID</th>
              <th class="px-2 sm:px-3 py-2 text-left">Пользователь</th>
              <th class="px-2 sm:px-3 py-2 text-left">Операция</th>
              <th class="px-2 sm:px-3 py-2 text-left">Техника</th>
              <th class="px-2 sm:px-3 py-2 text-left hidden md:table-cell">Комментарий</th>
              <th class="px-2 sm:px-3 py-2 text-left hidden lg:table-cell">Кому передано</th>
              <th class="px-2 sm:px-3 py-2 text-left">Статус</th>
              <th class="px-2 sm:px-3 py-2 text-left hidden sm:table-cell">Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="req in filteredRequests"
              :key="req.id"
              class="border-b hover:bg-gray-50 cursor-pointer"
              @click="goToRequestDetail(req.id)"
              @contextmenu.prevent="isAdmin && openContextMenu($event, req)"
            >
              <td class="px-2 sm:px-3 py-2">{{ req.id }}</td>
              <td class="px-2 sm:px-3 py-2">
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
                  <span class="truncate max-w-[100px] sm:max-w-[160px]">{{
                    req.user?.fullName || req.user?.name || req.user?.email || '-'
                  }}</span>
                </div>
              </td>
              <td class="px-2 sm:px-3 py-2">
                <span v-if="req.operation === 'repair'">Ремонт</span>
                <span v-else-if="req.operation === 'change'">Сменить</span>
                <span v-else-if="req.operation === 'transfer'">Передать</span>
                <span v-else-if="req.operation === 'error'">Сообщить об ошибке</span>
                <span v-else>{{ req.operation }}</span>
              </td>
              <td class="px-2 sm:px-3 py-2">
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
                  <span class="truncate max-w-[80px] sm:max-w-[140px]">
                    {{ asset.inv_number }}<span v-if="asset.name">, {{ asset.name }}</span>
                  </span>
                </div>
              </td>
              <td class="px-2 sm:px-3 py-2 hidden md:table-cell">{{ req.comment }}</td>
              <td class="px-2 sm:px-3 py-2 hidden lg:table-cell">
                <template v-if="req.operation === 'transfer'">
                  <span v-if="req.user_transfer">
                    {{
                      req.user_transfer.fullName ||
                      req.user_transfer.name ||
                      req.user_transfer.email
                    }}
                  </span>
                  <span v-else class="text-gray-400">—</span>
                </template>
                <template v-else>
                  <span class="text-gray-400">—</span>
                </template>
              </td>
              <td class="px-2 sm:px-3 py-2">
                <span v-if="req.status === 'pending'" class="text-yellow-600">В обработке</span>
                <span v-else-if="req.status === 'approved'" class="text-green-600">Одобрено</span>
                <span v-else-if="req.status === 'rejected'" class="text-red-600">Отклонено</span>
                <span v-else>{{ req.status }}</span>
              </td>
              <td class="px-2 sm:px-3 py-2 hidden sm:table-cell">
                {{ formatDate(req.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="requests.length === 0" class="text-center text-gray-400 py-6">Нет заявок</div>
      </div>
      <!-- Пагинация -->
      <div
        class="flex flex-col xs:flex-row justify-end items-center gap-2 mt-4"
        v-if="pagination.total > pagination.per_page"
      >
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

    <!-- Контекстное меню -->
    <div
      v-if="contextMenu.visible && isAdmin"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-white border rounded shadow-lg min-w-[160px] py-2"
      @click="contextMenu.visible = false"
    >
      <button
        class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        @click.stop="approveRequest(contextMenu.request)"
      >
        Одобрить
      </button>
      <button
        class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
        @click.stop="openRejectModal(contextMenu.request)"
      >
        Отклонить
      </button>
    </div>

    <!-- Модалка отказа -->
    <BaseModal v-model="showRejectModal" title="Причина отказа">
      <div class="flex flex-col gap-4">
        <textarea
          v-model="rejectComment"
          rows="3"
          class="w-full border rounded px-3 py-2"
          placeholder="Укажите причину отказа"
        ></textarea>
      </div>
      <template #footer>
        <button
          type="button"
          class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          @click="showRejectModal = false"
        >
          Отмена
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          :disabled="!rejectComment.trim()"
          @click="rejectRequest"
        >
          Отклонить
        </button>
      </template>
    </BaseModal>
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
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  request: null,
})
const showRejectModal = ref(false)
const rejectComment = ref('')
const rejectRequestId = ref(null)
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
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
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
      all = all.filter((req) => req.status === 'pending' && req.created_by === currentUser.value.id)
    } else {
      all = all.filter((req) => req.status === 'pending')
    }
    requests.value = all
    pagination.value = {
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1,
      per_page: response.data.per_page || 20,
      total: response.data.total || requests.value.length,
    }
  } catch (error) {
    // Для отладки покажите ошибку сервера
    let msg = error.response?.data?.message || error.message
    alert('Ошибка при загрузке заявок: ' + msg)
    requests.value = []
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
    const userStr = (req.user?.fullName || '') + (req.user?.name || '') + (req.user?.email || '')
    const assetsStr = (req.assets || [])
      .map((a) => [a.inv_number, a.name, a.type, a.brand].join(' '))
      .join(' ')
    return (
      userStr.toLowerCase().includes(query) ||
      assetsStr.toLowerCase().includes(query) ||
      (req.comment && req.comment.toLowerCase().includes(query)) ||
      (req.operation && req.operation.toLowerCase().includes(query)) ||
      (req.status && req.status.toLowerCase().includes(query))
    )
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

function openContextMenu(event, req) {
  if (!isAdmin.value) return
  contextMenu.value.visible = true
  contextMenu.value.x = event.clientX
  contextMenu.value.y = event.clientY
  contextMenu.value.request = req
  document.addEventListener('click', closeContextMenu)
}
function closeContextMenu() {
  contextMenu.value.visible = false
  document.removeEventListener('click', closeContextMenu)
}

// --- Одобрение заявки ---
async function approveRequest(req) {
  contextMenu.value.visible = false
  try {
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post(
      `/api/asset-requests/${req.id}/approve`,
      {},
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      },
    )
    fetchRequests(pagination.value.current_page)
    // Обновить уведомления после принятия заявки
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при одобрении заявки: ' + (e.response?.data?.message || e.message))
  }
}

// --- Отклонение заявки ---
function openRejectModal(req) {
  contextMenu.value.visible = false
  rejectRequestId.value = req.id
  rejectComment.value = ''
  showRejectModal.value = true
  nextTick(() => {
    // Фокус на textarea, если нужно
  })
}

async function rejectRequest() {
  showRejectModal.value = false
  try {
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post(
      `/api/asset-requests/${rejectRequestId.value}/reject`,
      { comment: rejectComment.value },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      },
    )
    fetchRequests(pagination.value.current_page)
    // Обновить уведомления после отклонения заявки
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при отклонении заявки: ' + (e.response?.data?.message || e.message))
  }
}

function goToRequestDetail(requestId) {
  // Закрыть контекстное меню, если оно открыто
  contextMenu.value.visible = false
  // Переход по маршруту (убедитесь, что маршрут существует)
  router.push(`/asset-requests/${requestId}`)
}
</script>

<style scoped>
/* ...existing code or add your styles here... */
</style>
