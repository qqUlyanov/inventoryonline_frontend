<template>
  <div class="p-6 flex flex-col gap-6 relative">
    <!-- Верхняя часть -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Левая колонка: карточка пользователя (аналогично UserDetailView) -->
      <div class="flex flex-col gap-6 xl:col-span-1">
        <div
          class="rounded-xl p-6 text-white flex flex-col items-center text-center bg-cover bg-center relative overflow-hidden min-h-[220px]"
          :style="{
            backgroundImage: request.user?.fullName ? `url('/images/${backgroundImage}')` : 'none',
          }"
        >
          <div
            class="absolute inset-0 bg-black/50 pointer-events-none rounded-xl"
            :class="!request.user?.fullName ? 'bg-gray-200' : ''"
          ></div>
          <div
            class="mb-4 w-20 h-20 rounded-full bg-gray-300 z-10 flex items-center justify-center"
          >
            <template v-if="request.user?.fullName">
              <span class="text-3xl font-bold text-white uppercase">
                {{
                  request.user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                }}
              </span>
            </template>
            <template v-else>
              <div class="w-full h-full rounded-full bg-gray-300 animate-pulse"></div>
            </template>
          </div>
          <div class="flex items-center gap-2 rounded-lg px-4 py-2 z-10 flex-col w-full">
            <span class="font-medium text-xl block min-h-[28px] w-full text-center">
              <span v-if="request.user?.fullName">{{ request.user.fullName }}</span>
              <span v-else class="inline-block w-32 h-7 bg-gray-300 rounded animate-pulse"></span>
            </span>
            <span class="text-base text-white block min-h-[22px] w-full text-center">
              <span v-if="request.user?.position">{{ request.user.position }}</span>
              <span v-else class="inline-block w-20 h-5 bg-gray-300 rounded animate-pulse"></span>
            </span>
          </div>
        </div>
        <!-- Информация о заявке -->
        <div class="rounded-xl p-8 bg-white flex flex-col gap-6 text-base text-gray-700">
          <div class="flex items-center gap-6">
            <span class="font-semibold text-xl">Заявка №{{ request.id }}</span>
            <span
              class="px-4 py-2 rounded text-base"
              :class="{
                'bg-yellow-100 text-yellow-700': request.status === 'pending',
                'bg-green-100 text-green-700': request.status === 'approved',
                'bg-red-100 text-red-700': request.status === 'rejected',
              }"
            >
              <span v-if="request.status === 'pending'">В обработке</span>
              <span v-else-if="request.status === 'approved'">Одобрено</span>
              <span v-else-if="request.status === 'rejected'">Отклонено</span>
              <span v-else>{{ request.status }}</span>
            </span>
            <span class="ml-auto text-gray-400 text-base">{{
              formatDate(request.created_at)
            }}</span>
          </div>
          <div class="mt-2">
            <span class="font-semibold">Операция:</span>
            <span class="ml-2">
              <span v-if="request.operation === 'repair'">Ремонт</span>
              <span v-else-if="request.operation === 'change'">Сменить</span>
              <span v-else-if="request.operation === 'transfer'">Передать</span>
              <span v-else-if="request.operation === 'error'">Сообщить об ошибке</span>
              <span v-else>{{ request.operation }}</span>
            </span>
          </div>
        </div>
      </div>
      <!-- Правая колонка: информация о заявке (техника и комментарий) -->
      <div class="flex flex-col gap-6 xl:col-span-2">
        <!-- Сначала техника -->
        <div class="rounded-xl bg-white p-6 flex flex-col gap-4 overflow-hidden">
          <div class="text-lg font-semibold mb-2">Информация о технике</div>
          <div class="flex flex-col gap-2">
            <div
              v-for="asset in request.assets"
              :key="asset.id"
              class="flex items-center border rounded p-2 cursor-pointer hover:bg-blue-50 transition"
              @click="goToAssetDetail(asset.id)"
              style="min-height: 56px"
            >
              <div class="flex items-center gap-10 w-48 min-w-[140px]">
                <img
                  v-if="asset.photo"
                  :src="asset.photo"
                  alt=""
                  class="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0"
                >
                  <i class="ri-image-line text-base"></i>
                </div>
                <span
                  class="truncate text-sm font-medium max-w-[100px] text-gray-900"
                  :title="asset.inv_number"
                >
                  {{ asset.inv_number }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="grid grid-cols-4 gap-x-10 items-center w-full">
                  <span
                    class="truncate text-sm font-medium max-w-[160px] text-gray-900"
                    :title="asset.name"
                  >
                    {{ asset.name }}
                  </span>
                  <span
                    class="truncate text-sm font-medium max-w-[110px] text-gray-900"
                    :title="asset.type"
                  >
                    {{ asset.type }}
                  </span>
                  <span
                    class="truncate text-sm font-medium max-w-[110px] text-gray-900"
                    :title="asset.brand"
                  >
                    {{ asset.brand }}
                  </span>
                  <span
                    class="truncate text-sm font-medium max-w-[110px] text-gray-900"
                    :title="asset.status"
                  >
                    {{ asset.status }}
                  </span>
                </div>
              </div>
            </div>
            <!-- Добавлено: отображение кому передано, если операция transfer -->
            <div
              v-if="request.operation === 'transfer'"
              class="flex items-center gap-2 mt-2 text-sm text-gray-700"
            >
              <span class="font-semibold">Кому передано:</span>
              <span v-if="request.user_transfer">
                <router-link
                  v-if="request.user_transfer.id"
                  :to="{ path: `/users/${request.user_transfer.id}` }"
                  class="text-blue-600 hover:underline"
                >
                  {{
                    request.user_transfer.fullName ||
                    request.user_transfer.name ||
                    request.user_transfer.email
                  }}
                </router-link>
                <span v-else>
                  {{
                    request.user_transfer.fullName ||
                    request.user_transfer.name ||
                    request.user_transfer.email
                  }}
                </span>
              </span>
              <span v-else class="text-gray-400">—</span>
            </div>
            <!-- конец добавленного -->
          </div>
        </div>
        <!-- Затем комментарий -->
        <div class="rounded-xl bg-white p-6 flex flex-col gap-4 overflow-hidden relative">
          <div class="text-lg font-semibold mb-2">Комментарий пользователя</div>
          <div class="bg-gray-50 rounded p-3 min-h-[32px] mb-2">
            {{ request.comment || '—' }}
          </div>
          <div v-if="request.status === 'rejected' && request.reject_comment">
            <div class="font-semibold mb-1 text-red-700">Причина отказа:</div>
            <div class="bg-red-50 rounded p-3 min-h-[32px] text-red-700">
              {{ request.reject_comment }}
            </div>
          </div>
        </div>
        <!-- Блок с кнопками действий -->
        <div
          v-if="request.status === 'pending' && isAdmin"
          class="rounded-xl bg-white p-6 flex justify-end mt-2 shadow-sm"
        >
          <div class="flex gap-2">
            <button
              class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              @click="onApproveClick"
              :disabled="loading"
            >
              Принять
            </button>
            <button
              class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              @click="showRejectModal = true"
              :disabled="loading"
            >
              Отклонить
            </button>
          </div>
        </div>
        <!-- Модалка причины отказа -->
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
              :disabled="!rejectComment.trim() || loading"
              @click="rejectRequest"
            >
              Отклонить
            </button>
          </template>
        </BaseModal>
        <!-- Кнопка завершения ремонта -->
        <div
          v-if="isAdmin && request.operation === 'repair' && request.status === 'in_progress'"
          class="flex justify-end mt-4"
        >
          <button
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            :disabled="loading"
            @click="completeRepair"
          >
            Завершить ремонт
          </button>
        </div>
        <!-- Модал выбора или создания техники для смены -->
        <BaseModal v-model="showFreeAssetModal" title="Выберите или создайте новую технику">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2 mb-2">
              <input
                v-model="freeAssetSearch"
                type="text"
                placeholder="Поиск по названию или инв. номеру..."
                class="border rounded px-3 py-2 w-full"
              />
              <button
                type="button"
                class="text-blue-600 hover:text-blue-800 text-2xl flex items-center justify-center w-8 h-8"
                @click="showCreateAssetModal = true"
                title="Добавить новую технику"
              >
                <i class="ri-add-line"></i>
              </button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div
                v-for="asset in filteredFreeAssets"
                :key="asset.id"
                class="flex items-center gap-2 p-2 border rounded mb-1 cursor-pointer hover:bg-blue-50"
                :class="{ 'bg-blue-100': selectedFreeAssetId === asset.id }"
                @click="selectedFreeAssetId = asset.id"
              >
                <img v-if="asset.photo" :src="asset.photo" class="w-8 h-8 rounded object-cover" />
                <div
                  v-else
                  class="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400"
                >
                  <i class="ri-image-line"></i>
                </div>
                <!-- Вся информация о технике в одну строку -->
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0 w-full">
                  <span class="font-medium truncate max-w-[90px]">{{ asset.inv_number }}</span>
                  <span class="text-gray-500 text-xs truncate max-w-[120px]">{{ asset.name }}</span>
                  <span class="text-gray-400 text-xs truncate max-w-[80px]"
                    >Тип: {{ asset.type || '—' }}</span
                  >
                  <span class="text-gray-400 text-xs truncate max-w-[80px]"
                    >Бренд: {{ asset.brand || '—' }}</span
                  >
                  <span class="text-gray-400 text-xs truncate max-w-[80px]"
                    >Кабинет: {{ asset.room || '—' }}</span
                  >
                  <span class="text-gray-400 text-xs truncate max-w-[80px]"
                    >Цена: {{ asset.price ? asset.price + ' ₽' : '—' }}</span
                  >
                </div>
                <span class="ml-auto text-xs text-gray-400">{{ asset.status }}</span>
              </div>
              <div v-if="filteredFreeAssets.length === 0" class="text-gray-400 text-center py-4">
                Нет свободной техники
              </div>
            </div>
          </div>
          <template #footer>
            <button
              type="button"
              class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              @click="showFreeAssetModal = false"
            >
              Отмена
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              :disabled="!selectedFreeAssetId || loading"
              @click="confirmFreeAsset"
            >
              Выбрать
            </button>
          </template>
        </BaseModal>
        <!-- Модал создания новой техники для смены -->
        <CreateItemModal
          v-model="showCreateAssetModal"
          :targetUserId="request.user?.id"
          @create="onNewAssetCreated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Cookies from 'js-cookie'
import BaseModal from '@/components/BaseModal.vue'
import CreateItemModal from '@/components/CreateItemModal.vue'
import { nextTick } from 'vue'

const route = useRoute()
const router = useRouter()
const request = ref({})
const loading = ref(true)
const showRejectModal = ref(false)
const rejectComment = ref('')
const assetSearch = ref('')
const usersList = ref([])
const selectedAssetId = ref(null)
const showCreateAssetModal = ref(false)
const freeAssetSearch = ref('')
const freeAssets = ref([])
const selectedFreeAssetId = ref(null)
const showFreeAssetModal = ref(false)

const isAdmin = ref(false)

onMounted(async () => {
  // Получаем роль пользователя
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const userResp = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    isAdmin.value = userResp.data.role === 'admin'
  } catch (e) {
    isAdmin.value = false
  }
  await fetchRequest()
})

const positionBackgrounds = {
  Учитель: 'teacher_bg.jpg',
  Библиотекарь: 'library_bg.jpg',
  Завуч: 'head_teacher_bg.jpg',
  Директор: 'director_bg.jpg',
  Охранник: 'security_bg.jpg',
  Повар: 'dining_room_bg.jpg',
  Секретарь: 'secretary_bg.jpg',
  Владелец: 'director_bg.jpg',
}
const backgroundImage = computed(() => {
  return positionBackgrounds[request.value.user?.position] || 'default_bg.jpg'
})

async function fetchRequest() {
  loading.value = true
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    const response = await axios.get(`/api/asset-requests/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'X-XSRF-TOKEN': decodeURIComponent(token),
      },
      withCredentials: true,
    })
    request.value = response.data
  } catch (e) {
    request.value = {}
  } finally {
    loading.value = false
  }
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

async function approveRequest() {
  loading.value = true
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    // --- логика для смены техники ---
    if (request.value.operation === 'change') {
      await fetchFreeAssets()
      showFreeAssetModal.value = true
      loading.value = false
      return
    }
    // Если заявка на ремонт, меняем статус на 'in_progress', иначе обычное одобрение
    if (request.value.operation === 'repair') {
      await axios.post(
        `/api/asset-requests/${route.params.id}/set-in-progress`,
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
      // Изменение статуса техники на 'В ремонте'
      for (const asset of request.value.assets || []) {
        await axios.put(
          `/api/assets/${asset.id}`,
          { status: 'В ремонте' },
          {
            withCredentials: true,
            headers: {
              'X-XSRF-TOKEN': decodeURIComponent(token),
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json',
            },
          },
        )
      }
    } else {
      await axios.post(
        `/api/asset-requests/${route.params.id}/approve`,
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
      // --- добавлено: логика передачи или ремонта ---
      if (request.value.operation === 'transfer' && request.value.user_transfer?.id) {
        // Передача техники новому пользователю
        for (const asset of request.value.assets || []) {
          await axios.put(
            `/api/assets/${asset.id}`,
            { user_id: request.value.user_transfer.id },
            {
              withCredentials: true,
              headers: {
                'X-XSRF-TOKEN': decodeURIComponent(token),
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json',
              },
            },
          )
        }
      }
    }
    // --- после успешного действия переходим на страницу заявок ---
    router.push('/requests/actual')
    // Обновить уведомления после принятия заявки
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при одобрении заявки: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

async function completeRepair() {
  loading.value = true
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post(
      `/api/asset-requests/${route.params.id}/complete`,
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
    // Вернуть статус техники на 'Используется'
    for (const asset of request.value.assets || []) {
      await axios.put(
        `/api/assets/${asset.id}`,
        { status: 'Используется' },
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': decodeURIComponent(token),
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        },
      )
    }
    router.push('/analytics/repair')
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при завершении ремонта: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

async function rejectRequest() {
  showRejectModal.value = false
  loading.value = true
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post(
      `/api/asset-requests/${route.params.id}/reject`,
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
    // Переход на актуальные заявки
    router.push('/requests/actual')
    // Обновить уведомления после отклонения заявки
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при отклонении заявки: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
    rejectComment.value = ''
  }
}

function goToAssetDetail(id) {
  if (id) router.push({ name: 'AssetDetail', params: { id } })
}

// Получить список пользователей с техникой (для выбора новой техники)
async function fetchUsersWithAssets() {
  try {
    const resp = await axios.get('/api/users-with-stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    usersList.value = Array.isArray(resp.data)
      ? resp.data.map((u) => ({
          ...u,
          assets: (u.assets || []).filter((a) => a.status === 'Используется'),
        }))
      : []
  } catch (e) {
    usersList.value = []
  }
}

const filteredUsers = computed(() => {
  const q = assetSearch.value.trim().toLowerCase()
  return usersList.value
    .map((user) => ({
      ...user,
      assets: (user.assets || []).filter((asset) => {
        if (!q) return true
        return (
          (asset.name && asset.name.toLowerCase().includes(q)) ||
          (asset.inv_number && asset.inv_number.toLowerCase().includes(q))
        )
      }),
    }))
    .filter((user) => user.assets && user.assets.length > 0)
})

// Заменяем approveRequest на onApproveClick для универсальной логики
function onApproveClick() {
  if (request.value.operation === 'change') {
    showCreateAssetModal.value = true
    return
  }
  approveRequest()
}

// Подтверждение выбора новой техники для смены
async function confirmFreeAsset() {
  if (!selectedFreeAssetId.value) return
  loading.value = true
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    // 1. Отвязать старую технику от пользователя (status = 'Свободен', user_id = null)
    for (const oldAsset of request.value.assets || []) {
      await axios.put(
        `/api/assets/${oldAsset.id}`,
        { user_id: null, status: 'Свободен' },
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': decodeURIComponent(token),
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        },
      )
    }
    // 2. Привязать выбранную свободную технику к пользователю
    await axios.put(
      `/api/assets/${selectedFreeAssetId.value}`,
      { user_id: request.value.user.id, status: 'Используется' },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      },
    )
    // 3. Одобрить заявку
    await axios.post(
      `/api/asset-requests/${route.params.id}/approve`,
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
    // Сбросить состояния и закрыть модалки
    showFreeAssetModal.value = false
    selectedFreeAssetId.value = null
    router.push('/requests/actual')
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при смене техники: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

// После создания новой техники
async function onNewAssetCreated(asset) {
  if (!asset || !asset.id) return
  loading.value = true
  try {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    // 1. Отвязать старую технику от пользователя (status = 'Свободен', user_id = null)
    for (const oldAsset of request.value.assets || []) {
      await axios.put(
        `/api/assets/${oldAsset.id}`,
        { user_id: null, status: 'Свободен' },
        {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': decodeURIComponent(token),
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            Accept: 'application/json',
          },
        },
      )
    }
    // 2. Привязка новой техники к пользователю уже происходит при создании (через targetUserId и статус 'Используется')
    // 3. Одобрить заявку
    await axios.post(
      `/api/asset-requests/${route.params.id}/approve`,
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
    // Сбросить состояния и закрыть модалки
    showCreateAssetModal.value = false
    showFreeAssetModal.value = false
    selectedFreeAssetId.value = null
    router.push('/requests/actual')
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 300)
    }
  } catch (e) {
    alert('Ошибка при смене техники: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

onMounted(fetchRequest)
</script>

<style scoped>
/* ...existing code or add your styles here... */
</style>
