<template>
  <div class="p-2 sm:p-5 flex flex-col gap-5">
    <!-- Заголовок и кнопки действий -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div class="text-xl sm:text-2xl font-bold w-full truncate">
        <div v-if="!asset" class="w-32 h-6 bg-gray-300 rounded-md"></div>
        <span v-else>{{ asset?.name }}</span>
      </div>
      <div class="flex items-center gap-2 ml-0 sm:ml-auto w-full sm:w-auto">
        <button
          v-if="isAdmin"
          class="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm sm:text-base"
          @click="showTransferModal = true"
          :disabled="!asset"
        >
          <i class="ri-share-forward-line"></i>
          <span>Передать</span>
        </button>
        <button
          v-if="isAdmin"
          @click="openEditModal"
          class="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          :disabled="!asset"
        >
          <i class="ri-edit-line"></i>
          <span>Редактировать</span>
        </button>
        <button
          v-if="isAdmin"
          @click="showDeleteModal = true"
          class="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm sm:text-base"
          :disabled="!asset"
        >
          <i class="ri-delete-bin-line"></i>
          <span>Удалить</span>
        </button>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
      <!-- Левая колонка -->
      <div
        class="bg-white p-3 sm:p-5 rounded-lg flex flex-col gap-5 shadow-lg self-start sticky top-2 sm:top-8 h-fit"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            v-if="asset?.photo || asset?.image_path"
            class="w-32 h-32 sm:w-48 sm:h-48 bg-gray-200 rounded-lg overflow-hidden flex justify-center items-center text-white relative"
          >
            <img
              v-if="asset?.photo"
              :src="asset.photo"
              alt="Asset image"
              class="w-full h-full object-cover"
              :class="{ 'opacity-60 cursor-pointer': isEditing }"
              @click="isEditing && triggerImageSelect()"
              style="transition: opacity 0.2s"
            />
            <img
              v-else-if="asset?.image_path"
              :src="`/storage/${asset.image_path}`"
              alt="Asset image"
              class="w-full h-full object-cover"
              :class="{ 'opacity-60 cursor-pointer': isEditing }"
              @click="isEditing && triggerImageSelect()"
              style="transition: opacity 0.2s"
            />
            <div
              v-if="isEditing"
              class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
              @click="triggerImageSelect"
            >
              <i class="ri-upload-cloud-2-line text-3xl mb-1"></i>
              <span class="text-xs">Выбрать фото</span>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImageChange"
            />
          </div>
          <div
            v-else
            class="w-32 h-32 sm:w-48 sm:h-48 bg-gray-300 rounded-lg flex justify-center items-center text-gray-700 text-xl relative"
          >
            <i class="ri-image-line"></i>
            <div
              v-if="isEditing"
              class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
              @click="triggerImageSelect"
            >
              <i class="ri-upload-cloud-2-line text-3xl mb-1"></i>
              <span class="text-xs">Выбрать фото</span>
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImageChange"
            />
          </div>
          <span
            v-if="asset"
            class="font-semibold text-base sm:text-lg text-center w-full truncate"
            >{{ asset?.name }}</span
          >
          <div v-else class="w-32 h-6 bg-gray-300 rounded-md"></div>
        </div>
        <form v-if="asset" @submit.prevent="saveEdit" class="w-full flex flex-col gap-2">
          <table
            class="w-full text-xs sm:text-sm text-gray-600"
            :class="{ 'pointer-events-none opacity-60': !isEditing }"
          >
            <tbody>
              <tr v-for="(value, key) in assetInfo" :key="key">
                <td class="py-1 font-medium">{{ value.label }}</td>
                <td class="py-1 text-right">
                  <template v-if="isEditing && editableFields.includes(key)">
                    <select
                      v-if="key === 'status'"
                      v-model="editForm[key]"
                      class="border rounded px-2 py-1 w-full text-right"
                    >
                      <option value="Используется">Используется</option>
                      <option value="В ремонте">В ремонте</option>
                      <option value="Об. статуса">Об. статуса</option>
                    </select>
                    <input
                      v-else
                      v-model="editForm[key]"
                      class="border rounded px-2 py-1 w-full text-right"
                      :type="key === 'price' ? 'number' : 'text'"
                    />
                  </template>
                  <template v-else>
                    {{ value.data }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="asset.user" class="w-full" style="display: table; table-layout: fixed">
            <div
              class="border-t border-gray-100 text-xs sm:text-sm text-gray-600"
              style="display: table-row"
            >
              <div
                class="py-1 font-medium align-middle"
                style="display: table-cell; width: 50%; vertical-align: middle"
              >
                Владелец
              </div>
              <div
                class="py-1 text-right align-middle"
                style="display: table-cell; width: 50%; vertical-align: middle"
              >
                <router-link
                  v-if="asset.user.id || asset.user_id"
                  :to="`/users/${asset.user.id || asset.user_id}`"
                  class="text-indigo-600 hover:underline"
                >
                  {{ asset.user.fullName || asset.user.name || asset.user.email }}
                </router-link>
                <span v-else>{{ asset.user.fullName || asset.user.name || asset.user.email }}</span>
              </div>
            </div>
          </div>
          <div v-if="isEditing" class="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              type="submit"
              class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              Сохранить
            </button>
            <button
              type="button"
              @click="cancelEdit"
              class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 w-full sm:w-auto"
            >
              Отмена
            </button>
          </div>
        </form>
        <div v-else class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex justify-between">
            <div class="w-1/3 h-6 bg-gray-300 rounded-md"></div>
            <div class="w-1/3 h-6 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      </div>

      <!-- Правая колонка -->
      <div class="flex flex-col gap-5">
        <!-- Секция Паспорт техники -->
        <div v-if="asset" class="bg-white p-3 sm:p-5 rounded-lg shadow-lg overflow-x-auto mb-5">
          <h2 class="text-base sm:text-lg font-bold mb-3 flex items-center gap-3">
            Паспорт техники
            <button
              class="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm"
              @click="downloadPassportPDF"
            >
              <i class="ri-download-2-line"></i>
              Скачать PDF
            </button>
          </h2>
          <form v-if="isEditing" class="w-full">
            <table class="w-full text-xs sm:text-sm text-gray-700 border-t">
              <tbody>
                <tr v-for="field in currentPassportSchema" :key="field.key">
                  <td class="py-1 pr-2 font-medium w-1/3">{{ field.label }}</td>
                  <td class="py-1 pl-2">
                    <template
                      v-if="['inv_number', 'brand', 'model', 'room', 'status'].includes(field.key)"
                    >
                      <input
                        :value="asset[field.key] ?? ''"
                        class="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
                        type="text"
                        readonly
                      />
                    </template>
                    <template v-else>
                      <input
                        v-model="passportEditForm[field.key]"
                        class="border rounded px-2 py-1 w-full"
                        type="text"
                      />
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
          <table v-else class="w-full text-xs sm:text-sm text-gray-700 border-t">
            <tbody>
              <tr v-for="field in currentPassportSchema" :key="field.key">
                <td class="py-1 pr-2 font-medium w-1/3">{{ field.label }}</td>
                <td class="py-1 pl-2">{{ asset[field.key] ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="asset" class="bg-white p-3 sm:p-5 rounded-lg shadow-lg overflow-x-auto">
          <h2 class="text-base sm:text-lg font-bold mb-3">
            Последние операции ({{ operations.length }})
          </h2>
          <div class="flex flex-col gap-3">
            <div v-for="(operation, index) in operations" :key="index" class="border-b pb-3">
              <div class="flex items-center gap-2">
                <i :class="operation.icon" :style="{ color: operation.color }"></i>
                <strong class="font-semibold">{{ operation.title }}</strong>
              </div>
              <div class="ml-6">{{ operation.description }}</div>
              <div class="ml-6 text-xs text-gray-500">{{ operation.user }}</div>
              <div class="ml-6 text-xs text-gray-500">{{ operation.date }}</div>
            </div>
          </div>
        </div>
        <div v-else class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-6 bg-gray-300 rounded-md"></div>
        </div>
        <!-- <div v-if="asset" class="bg-white p-3 sm:p-5 rounded-lg shadow-lg overflow-x-auto">
          <h2 class="text-base sm:text-lg font-bold mb-3">Комментарии ({{ comments.length }})</h2>
          <div v-for="(comment, index) in comments" :key="index" class="border-b pb-3">
            <div class="font-semibold text-xs sm:text-sm">{{ comment.user }}</div>
            <div class="ml-6 text-gray-700">{{ comment.description }}</div>
            <div class="ml-6 text-xs text-gray-500">{{ comment.date }}</div>
          </div>
        </div> -->
        <div v-else class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-6 bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>

    <!-- Модальное окно передачи ТМЦ -->
    <!-- Модальное окно передачи техники -->
    <BaseModal
      v-model:modelValue="showTransferModal"
      title="Передать технику другому пользователю"
      class="z-50"
    >
      <template #default>
        <div class="w-full max-w-[1100px] mx-auto">
          <div
            v-if="usersLoading"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto mb-8"
          >
            <div
              v-for="n in 6"
              :key="n"
              class="flex items-center gap-6 rounded-2xl bg-gray-200 animate-pulse min-h-[120px] px-6 py-6"
            >
              <div class="w-16 h-16"></div>
              <div class="flex flex-col flex-1 min-w-0 items-end text-right gap-2">
                <div class="h-4 w-24 bg-gray-200 rounded"></div>
                <div class="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="mb-8">
              <input
                v-model="userSearch"
                type="text"
                placeholder="Поиск по имени или email"
                class="w-full px-4 py-2 border rounded-xl"
              />
            </div>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
              style="max-height: 600px; overflow-y: auto"
            >
              <div
                v-for="user in filteredUsers"
                :key="user.id"
                @click="transferToUser(user.id)"
                class="flex items-center gap-8 rounded-2xl cursor-pointer overflow-hidden group text-white transition-transform duration-200 hover:scale-[0.98] active:scale-95 min-h-[120px] px-3 py-6"
                :style="`
                  background-image:
                    linear-gradient(rgba(30,32,40,0.72), rgba(30,32,40,0.72)),
                    url('/images/${getBackground(user.position)}');
                  background-size: cover;
                  background-position: center;
                  background-repeat: no-repeat;
                  background-color: #23272f;
                `"
              >
                <img
                  v-if="user.avatar_path"
                  :src="user.avatar_path"
                  alt="avatar"
                  class="w-14 h-14 rounded-full object-cover border border-white shadow bg-white"
                />
                <div
                  v-else
                  class="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-gray-400 text-2xl"
                >
                  <i class="ri-user-3-line"></i>
                </div>
                <div class="flex flex-col flex-1 min-w-0 items-end text-right">
                  <div class="font-medium text-base truncate" :title="user.fullName || user.name">
                    {{ user.fullName || user.name }}
                  </div>
                  <div class="text-xs text-white/80 truncate">{{ user.email }}</div>
                  <div class="text-xs text-white/60">Каб. №{{ user.room }}</div>
                </div>
              </div>
              <div
                v-if="filteredUsers.length === 0"
                class="col-span-full text-gray-400 text-sm text-center py-8"
              >
                Нет пользователей
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseModal>

    <!-- Модальное окно удаления ТМЦ -->
    <!-- Модальное окно удаления техники -->
    <BaseModal v-model="showDeleteModal" title="Удалить технику?">
      <div class="p-4">
        <p>Вы действительно хотите удалить эту технику?</p>
        <div class="flex gap-3 mt-6 justify-end">
          <button
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            @click="showDeleteModal = false"
          >
            Отмена
          </button>
          <button
            class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            @click="deleteAsset"
          >
            Удалить
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import BaseModal from '@/components/BaseModal.vue'
import Cookies from 'js-cookie'
import jsPDF from 'jspdf'

// Схемы паспортов для разных типов техники
const passportSchemas = {
  Ноутбук: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'cpu', label: 'Процессор' },
    { key: 'ram', label: 'ОЗУ' },
    { key: 'storage', label: 'Накопитель' },
    { key: 'os', label: 'ОС' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  Монитор: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'diagonal', label: 'Диагональ' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  Принтер: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'type', label: 'Тип' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  'Системный блок': [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'cpu', label: 'Процессор' },
    { key: 'ram', label: 'ОЗУ' },
    { key: 'storage', label: 'Накопитель' },
    { key: 'os', label: 'ОС' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  Проектор: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  Сканер: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  Мышь: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  ИБП: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
  Маршрутизатор: [
    { key: 'inv_number', label: 'Инвентарный номер' },
    { key: 'brand', label: 'Бренд' },
    { key: 'model', label: 'Модель' },
    { key: 'room', label: 'Кабинет' },
    { key: 'status', label: 'Статус' },
  ],
}

const route = useRoute()
const router = useRouter()

const asset = ref(null)
const operations = ref([])
const comments = ref([])
const assetId = route.params.id

const fetchAssetData = async () => {
  try {
    const response = await axios.get(`/api/assets/${assetId}`)
    asset.value = response.data.asset
    operations.value = response.data.operations
    comments.value = response.data.comments
  } catch (error) {
    console.error('Ошибка при загрузке данных о ТМЦ:', error)
    console.error('Ошибка при загрузке данных о технике:', error)
  }
}

const assetInfo = computed(() => {
  if (!asset.value) return {}

  // Функция для форматирования даты в user-friendly вид
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr.replace(' ', 'T'))
    if (isNaN(date)) return dateStr
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    inventory_number: { label: 'Инв. №', data: asset.value.inv_number },
    type: { label: 'Тип', data: asset.value.type },
    brand: { label: 'Бренд', data: asset.value.brand },
    room: { label: 'Кабинет', data: asset.value.room },
    status: { label: 'Статус', data: asset.value.status },
    updated_at: {
      label: 'Обновлено',
      data: formatDate(asset.value.updated_at),
      raw: asset.value.updated_at,
    },
  }
})

onMounted(async () => {
  // Получаем id текущего пользователя и его роль
  try {
    const resp = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    currentUserId.value = resp.data.id?.toString?.() || resp.data.id
    isAdmin.value = resp.data.role === 'admin'
  } catch (e) {
    currentUserId.value = null
    isAdmin.value = false
  }
  fetchAssetData()
})

const showTransferModal = ref(false)
const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')
const currentUserId = ref(null)
const isAdmin = ref(false)
const fetchUsers = async () => {
  usersLoading.value = true
  try {
    const resp = await axios.get('/api/users-with-stats')
    users.value = Array.isArray(resp.data) ? resp.data : []
  } catch (e) {
    users.value = []
  } finally {
    usersLoading.value = false
  }
}
watch(showTransferModal, (val) => {
  if (val) fetchUsers()
})
const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  let list = users.value
  if (q) {
    list = list.filter(
      (u) =>
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)),
    )
  }
  // Исключаем только если текущий пользователь уже владелец этой техники
  if (currentUserId.value && asset.value && asset.value.user_id) {
    if (String(asset.value.user_id) === String(currentUserId.value)) {
      list = list.filter((u) => String(u.id) !== String(currentUserId.value))
    }
  }
  return list
})
const transferToUser = async (targetUserId) => {
  if (!asset.value) return
  try {
    await axios.get('https://api.inventoryonline.ru/sanctum/csrf-cookie')
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post(
      `/api/assets/${asset.value.id}/transfer`,
      { user_id: targetUserId },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
        },
      },
    )
    showTransferModal.value = false
    await fetchAssetData()
    // alert('ТМЦ успешно передан') // alert убран
    // alert('Техника успешно передана') // alert убран
  } catch (e) {
    alert('Ошибка при передаче ТМЦ')
    alert('Ошибка при передаче техники')
  }
}
const sendToRepair = () => {}
const awaitStatusUpdate = () => {}
const assignToEmployee = () => {}
const showDeleteModal = ref(false)
const deleteAsset = async () => {
  if (!asset.value) return
  try {
    let userId = null
    if (asset.value.user?.id) userId = asset.value.user.id
    else if (asset.value.user_id) userId = asset.value.user_id
    else if (asset.value.user && asset.value.user.user_id) userId = asset.value.user.user_id
    if (userId) userId = String(userId)

    await axios.get('https://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    // ВАЖНО: 500 ошибка — это проблема на сервере, а не во фронте!
    // Проверьте, что на сервере реализован метод destroy (delete) для /api/assets/{id}
    // и что он не вызывает ошибку (например, нет связанных записей, нет ошибок в контроллере)
    await axios.post(
      `/api/assets/${asset.value.id}`,
      { _method: 'DELETE' },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    )
    // Используем router.replace и fallback на window.location.assign
    if (userId) {
      router.replace(`/users/${userId}`)
      setTimeout(() => {
        if (window.location.pathname !== `/users/${userId}`) {
          window.location.assign(`/users/${userId}`)
        }
      }, 200)
    } else {
      router.replace('/users')
      setTimeout(() => {
        if (window.location.pathname !== '/users') {
          window.location.assign('/users')
        }
      }, 200)
    }
  } catch (error) {
    // Для отладки покажите ошибку сервера:
    alert('Ошибка при удалении ТМЦ: ' + (error.response?.data?.message || error.message))
    alert('Ошибка при удалении техники: ' + (error.response?.data?.message || error.message))
  }
}

// Для карточек пользователей
const backgroundMap = {
  Учитель: 'teacher_bg.jpg',
  Библиотекарь: 'library_bg.jpg',
  Завуч: 'head_teacher_bg.jpg',
  Директор: 'director_bg.jpg',
  Охранник: 'security_bg.jpg',
  Повар: 'dining_room_bg.jpg',
  Секретарь: 'secretary_bg.jpg',
}
function getBackground(position) {
  return backgroundMap[position] || 'default.jpg'
}

const isEditing = ref(false)
const editForm = ref({})
const editableFields = [
  'name', // добавлено поле name для редактирования
  'inventory_number',
  'type',
  'brand',
  'room',
  'status',
  // 'updated_at', // убрано из редактируемых полей
  // добавьте другие ключи, если нужно
]
const imageInput = ref(null)
const passportEditForm = ref({})

function openEditModal() {
  if (!asset.value) return
  isEditing.value = true
  editForm.value = {
    name: asset.value.name || '', // добавлено поле name
    inventory_number: asset.value.inv_number,
    type: asset.value.type,
    brand: asset.value.brand,
    room: asset.value.room,
    status: asset.value.status,
    // updated_at не нужен для редактирования
    image: null, // для нового файла
    // добавьте другие поля, если нужно
  }
  // Для паспорта техники
  passportEditForm.value = {}
  currentPassportSchema.value.forEach((field) => {
    passportEditForm.value[field.key] = asset.value[field.key] ?? ''
  })
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!asset.value) return
  try {
    // 1. Обновляем CSRF cookie
    await axios.get('https://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')

    // 2. Формируем данные
    let data
    let headers = {
      withCredentials: true,
      headers: {
        'X-XSRF-TOKEN': decodeURIComponent(token),
        Accept: 'application/json',
      },
    }
    if (editForm.value.image) {
      data = new FormData()
      data.append('name', editForm.value.name) // обязательно добавляем name
      data.append('inv_number', editForm.value.inventory_number)
      data.append('type', editForm.value.type)
      data.append('brand', editForm.value.brand)
      data.append('room', editForm.value.room)
      data.append('status', editForm.value.status)
      data.append('image', editForm.value.image)
      // Добавляем паспортные поля
      for (const [key, value] of Object.entries(passportEditForm.value)) {
        if (!['inv_number', 'brand', 'model', 'room', 'status'].includes(key)) {
          data.append(key, value)
        }
      }
      headers.headers['Content-Type'] = 'multipart/form-data'
    } else {
      data = {
        name: editForm.value.name, // обязательно добавляем name
        inv_number: editForm.value.inventory_number,
        type: editForm.value.type,
        brand: editForm.value.brand,
        room: editForm.value.room,
        status: editForm.value.status,
      }
      // Добавляем паспортные поля
      for (const [key, value] of Object.entries(passportEditForm.value)) {
        if (!['inv_number', 'brand', 'model', 'room', 'status'].includes(key)) {
          data[key] = value
        }
      }
    }

    // 3. Удаляем Bearer-токен из headers (Laravel Sanctum требует только cookie, не Authorization)
    // 4. Запрос
    await axios.put(`/api/assets/${asset.value.id}`, data, headers)
    isEditing.value = false
    await fetchAssetData()
  } catch (e) {
    // Для отладки можно вывести ошибку полностью
    alert('Ошибка при сохранении изменений: ' + (e.response?.data?.message || e.message))
  }
}

function triggerImageSelect() {
  if (imageInput.value) imageInput.value.click()
}

function onImageChange(e) {
  const file = e.target.files && e.target.files[0]
  if (file) {
    editForm.value.image = file
    // Можно добавить предпросмотр, если нужно
  }
}

const currentPassportSchema = computed(() => {
  if (!asset.value) return []
  return passportSchemas[asset.value.type] || passportSchemas['Ноутбук'] || []
})

// Маппинг латинских подписей для PDF
const passportLabelsLatin = {
  'Инвентарный номер': 'Inventory number',
  Бренд: 'Brand',
  Модель: 'Model',
  Процессор: 'CPU',
  ОЗУ: 'RAM',
  Накопитель: 'Storage',
  ОС: 'OS',
  Кабинет: 'Room',
  Статус: 'Status',
  Диагональ: 'Diagonal',
  Тип: 'Type',
}

function downloadPassportPDF() {
  if (!asset.value) return
  const doc = new jsPDF()
  // Верхний заголовок по центру
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('EQUIPMENT PASSPORT', 105, 18, { align: 'center' })
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(
    'State Budgetary Educational Institution of the Rostov Region "Kamensky General F.P. Denisov Cossack Cadet Corps"',
    105,
    26,
    { align: 'center', maxWidth: 180 },
  )
  // Основной заголовок
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  const rowHeight = 8
  const tableRows = currentPassportSchema.value.length + 1 // +1 for header
  const tableWidth = 170 // чуть меньше ширины страницы
  const colWidth = tableWidth / 2
  const tableX = 20 // отступ слева
  let tableY = 52
  // Рисуем ячейки и текст
  for (let i = 0; i < tableRows; i++) {
    const yCell = tableY + i * rowHeight
    // Левая ячейка
    doc.rect(tableX, yCell, colWidth, rowHeight)
    // Правая ячейка
    doc.rect(tableX + colWidth, yCell, colWidth, rowHeight)
    // Текст
    if (i === 0) {
      doc.setFont(undefined, 'bold')
      doc.text('Field', tableX + 2, yCell + 6)
      doc.text('Value', tableX + colWidth + 2, yCell + 6)
      doc.setFont(undefined, 'normal')
    } else {
      const field = currentPassportSchema.value[i - 1]
      const label = passportLabelsLatin[field.label] || field.label
      const value = asset.value[field.key] ?? '-'
      doc.text(String(label), tableX + 2, yCell + 6)
      doc.text(String(value), tableX + colWidth + 2, yCell + 6)
    }
  }
  // Добавляем поля Date и Signature внизу страницы
  const pageHeight = doc.internal.pageSize.getHeight()
  const bottomY = pageHeight - 20
  doc.setFont(undefined, 'normal')
  doc.text('Date: ____________', tableX, bottomY)
  doc.text('Signature: ____________', tableX + colWidth + 20, bottomY)
  doc.save(`passport_${asset.value.inv_number || asset.value.id}.pdf`)
}
</script>
