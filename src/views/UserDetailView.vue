<template>
  <div class="p-6 flex flex-col gap-6 relative">
    <!-- Верхняя часть -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Левая колонка -->
      <div class="flex flex-col gap-6 xl:col-span-1">
        <!-- Профиль -->
        <div
          class="rounded-xl p-6 text-white flex flex-col items-center text-center bg-cover bg-center relative overflow-hidden min-h-[220px]"
          :style="{ backgroundImage: user.fullName ? `url('/images/${backgroundImage}')` : 'none' }"
        >
          <div
            class="absolute inset-0 bg-black/50 pointer-events-none rounded-xl"
            :class="!user.fullName ? 'bg-gray-200' : ''"
          ></div>
          <!-- Аватарка: одинаковый размер всегда -->
          <div
            class="mb-4 w-20 h-20 rounded-full bg-gray-300 z-10 flex items-center justify-center relative overflow-hidden"
          >
            <template v-if="user.avatar_path">
              <img :src="user.avatar_path" alt="avatar" class="w-full h-full object-cover" />
            </template>
            <template v-else-if="user.fullName">
              <span class="text-3xl font-bold text-white uppercase">
                {{
                  user.fullName
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
            <!-- Кнопка смены аватара -->
            <div
              v-if="isEditing && isAdmin"
              class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer group"
              @click="triggerAvatarSelect"
            >
              <i class="ri-upload-cloud-2-line text-2xl mb-1 text-white"></i>
              <span class="text-xs text-white">Сменить аватар</span>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onAvatarChange"
              />
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-lg px-4 py-2 z-10 flex-col w-full">
            <span class="font-medium text-xl block min-h-[28px] w-full text-center">
              <span v-if="user.fullName">{{ user.fullName }}</span>
              <span v-else class="inline-block w-32 h-7 bg-gray-300 rounded animate-pulse"></span>
            </span>
            <span class="text-base text-white block min-h-[22px] w-full text-center">
              <span v-if="user.position">{{ user.position }}</span>
              <span v-else class="inline-block w-20 h-5 bg-gray-300 rounded animate-pulse"></span>
            </span>
          </div>
        </div>

        <!-- Инфо (редактируемые поля) -->
        <form
          class="rounded-xl p-4 bg-white flex flex-col gap-4 text-sm text-gray-700"
          @submit.prevent="saveUserEdit"
        >
          <div class="flex justify-between items-center">
            <span>Email</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.email"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="email"
                autofocus
                :readonly="!isAdmin"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.email }}</span>
            </template>
          </div>
          <div class="flex justify-between items-center">
            <span>Должность</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.position"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="text"
                :readonly="!isAdmin"
                :tabindex="isAdmin ? 0 : -1"
                style="background-color: #fff"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.position }}</span>
            </template>
          </div>
          <div class="flex justify-between items-center">
            <span>ФИО</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.fullName"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="text"
                :readonly="!isAdmin"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.fullName }}</span>
            </template>
          </div>
          <div class="flex justify-between items-center">
            <span>Кабинет</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.room"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="text"
                :readonly="!isAdmin"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.room || '—' }}</span>
            </template>
          </div>
          <div class="flex gap-2 mt-2 justify-end">
            <button
              v-if="!isEditing && isAdmin"
              type="button"
              class="flex items-center gap-2 text-indigo-600 hover:underline"
              @click="startEdit"
            >
              <i class="ri-edit-line"></i> Редактировать
            </button>
            <template v-else>
              <button
                v-if="isEditing && isAdmin"
                type="button"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                @click="cancelUserEdit"
              >
                Отмена
              </button>
              <button
                v-if="isEditing && isAdmin"
                type="submit"
                class="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Сохранить
              </button>
              <button
                v-if="userId != currentUserId && isAdmin"
                type="button"
                class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                @click="deleteUser"
              >
                Удалить пользователя
              </button>
            </template>
          </div>
        </form>
      </div>

      <!-- Правая колонка -->
      <div class="flex flex-col gap-6 xl:col-span-2">
        <div class="rounded-xl bg-white p-6 flex flex-col gap-4 overflow-hidden">
          <div class="text-lg font-semibold mb-2">Последние операции ({{ operations.length }})</div>
          <div class="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2">
            <div v-for="(op, index) in operations" :key="index" class="relative pl-6">
              <div
                class="absolute left-0 top-1.5 w-3 h-3 rounded-full"
                :class="{
                  'bg-orange-400': op.action === 'return',
                  'bg-purple-400': op.action === 'accept',
                  'bg-blue-400': op.action !== 'return' && op.action !== 'accept',
                }"
              ></div>
              <div class="text-sm font-semibold">{{ op.description }}</div>
              <div class="text-gray-500 text-xs">{{ op.date }}</div>
              <div class="text-gray-400 text-xs mt-1">{{ op.author }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Таблица ТМЦ -->
    <!-- Таблица техники -->
    <div class="rounded-xl bg-white flex flex-col gap-4">
      <TableToolbar
        :search-value="itemSearch"
        :is-admin="isAdmin"
        @update:search="itemSearch = $event"
        @showFilter="showFilterModal = true"
        @showCreate="showCreateModal = true"
        @showUpload="showUploadModal = true"
        @showDownload="showDownloadModal = true"
      >
        <template #filter-modal>
          <ModalFilter
            v-model="showFilterModal"
            :filters="filters"
            @update:filters="updateFilters"
            @apply="applyFilters"
          />
        </template>
        <template v-if="isAdmin" #create-modal>
          <CreateItemModal
            v-model="showCreateModal"
            @create="handleCreate"
            :targetUserId="userId"
          />
        </template>
        <template v-if="isAdmin" #upload-modal>
          <ModalUpload
            v-model="showUploadModal"
            :targetUserId="userId"
            @update:modelValue="onUploadClose"
          />
        </template>
        <template v-if="isAdmin" #download-modal>
          <ModalDownload
            v-model="showDownloadModal"
            :format="downloadFormat"
            @update:format="(val) => (downloadFormat = val)"
            @download="handleDownload"
          />
        </template>
      </TableToolbar>

      <AssetTable
        :items="items"
        :selectable="true"
        v-model="selectedItems"
        :users-list="usersList"
        @rowClick="goToItem"
        @selectedItemsClick="handleSelectedItemsClick"
      />

      <!-- Пагинация -->
      <div class="flex justify-end mt-4" v-if="lastPage > 1">
        <button
          class="px-3 py-1 rounded bg-gray-200 mx-1"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Назад
        </button>
        <span class="px-2 py-1">{{ currentPage }} / {{ lastPage }}</span>
        <button
          class="px-3 py-1 rounded bg-gray-200 mx-1"
          :disabled="currentPage === lastPage"
          @click="goToPage(currentPage + 1)"
        >
          Вперёд
        </button>
      </div>
    </div>

    <!-- Модалка -->
    <BaseModal v-model="isEditModalOpen" title="Редактировать профиль">
      <div class="flex flex-col gap-4 text-sm">
        <div>
          <label class="block mb-1">ФИО</label>
          <input v-model="user.fullName" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block mb-1">Email</label>
          <input v-model="user.email" class="w-full border rounded px-3 py-2" />
        </div>

        <div class="flex justify-between mt-4">
          <!-- Кнопка удаления только если userId !== currentUserId -->
          <button
            v-if="userId != currentUserId"
            class="px-4 py-2 bg-red-600 text-white rounded"
            @click="deleteUser"
            type="button"
          >
            Удалить пользователя
          </button>
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded"
            @click="isEditModalOpen = false"
          >
            Сохранить
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BaseModal from '@/components/BaseModal.vue'
import AssetTable from '@/components/AssetTable.vue'
import TableToolbar from '@/components/TableToolbar.vue'
import ModalFilter from '@/components/ModalFilter.vue'
import CreateItemModal from '@/components/CreateItemModal.vue'
import ModalUpload from '@/components/ModalUpload.vue'
import ModalDownload from '@/components/ModalDownload.vue'
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const userId = route.params.id // Получаем ID пользователя из маршрута

const user = ref({})
const operations = ref([])
const items = ref([])
const isEditModalOpen = ref(false)
const itemSearch = ref('')
const filters = ref({})
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = 20
const isLoading = ref(true)

const filtersState = inject('filtersState', ref({}))

watch(
  [filters, itemSearch],
  () => {
    filtersState.value = { ...filters.value, search: itemSearch.value }
  },
  { immediate: true },
)

watch(filtersState, (val) => {
  if (Object.keys(val).length === 0) {
    filters.value = {}
    itemSearch.value = ''
    fetchItems(1)
  }
})

const fetchUserDetails = async () => {
  try {
    const response = await axios.get(`/api/users/${userId}/details`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    user.value = response.data
    operations.value = response.data.assetLog // Логи операций
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error)
  }
}

// Новый метод загрузки с фильтрами и поиском
const fetchItems = async (page = 1) => {
  try {
    isLoading.value = true
    const params = { page, per_page: perPage, user_id: userId, ...filters.value }
    if (itemSearch.value) {
      params.name = itemSearch.value // если поиск по имени, иначе поменяйте на нужное поле
    }
    const response = await axios.get('/api/assets', {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (Array.isArray(response.data.data)) {
      items.value = response.data.data
      currentPage.value = response.data.current_page
      lastPage.value = response.data.last_page
    } else if (Array.isArray(response.data)) {
      items.value = response.data
      currentPage.value = 1
      lastPage.value = 1
    }
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
  } finally {
    isLoading.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= lastPage.value) {
    fetchItems(page)
  }
}

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
  return positionBackgrounds[user.value.position] || 'default_bg.jpg'
})

// Добавим форматирование даты
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const selectedItems = ref([])
const showFilterModal = ref(false)
const showCreateModal = ref(false)
const showUploadModal = ref(false)
const showDownloadModal = ref(false)
const downloadFormat = ref('')

const filtersObject = computed(() => {
  const obj = {}
  for (const key in filters.value) {
    if (filters.value[key]) {
      obj[key] = filters.value[key]
    }
  }
  return obj
})

function toggleSelectAll() {
  if (isAllChecked.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = items.value.map((item) => item.id)
  }
}

function goToItem(id) {
  // Переход на детальную страницу техники
  router.push({ name: 'AssetDetail', params: { id } })
}

const updateFilters = (newFilters) => {
  filters.value = { ...newFilters }
  fetchItems(1)
}

function applyFilters() {
  // filteredItems пересчитается автоматически, если filters изменились
  // Если фильтры приходят из модалки, убедитесь что emit('update:filters', filters) вызывается из нее
}

function handleCreate(newItem) {
  items.value.unshift(newItem) // Добавить новый ТМЦ в начало списка
  items.value.unshift(newItem) // Добавить новую технику в начало списка
  showCreateModal.value = false
  fetchItems(currentPage.value)
}

function handleDownload() {
  // Логика скачивания данных
}

function onUploadClose(val) {
  // Если модалка закрылась после успешного импорта — обновить данные
  if (!val) {
    fetchItems(currentPage.value)
  }
}

watch(itemSearch, () => fetchItems(1))

const currentUserId = ref(null)
const userRole = ref(null)
const usersList = ref([]) // <--- добавить

onMounted(async () => {
  // Получаем id и роль текущего пользователя
  try {
    const resp = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    currentUserId.value = resp.data.id?.toString?.() || resp.data.id
    userRole.value = resp.data.role
  } catch (e) {
    currentUserId.value = null
    userRole.value = null
  }
  // --- загружаем список пользователей для передачи техники ---
  try {
    const usersResp = await axios.get('/api/users-with-stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    usersList.value = Array.isArray(usersResp.data) ? usersResp.data : []
  } catch (e) {
    usersList.value = []
  }
  fetchUserDetails()
  fetchItems()
})

async function deleteUser() {
  if (!confirm('Вы действительно хотите удалить этого пользователя?')) return
  try {
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie')
    const token = Cookies.get('XSRF-TOKEN')
    await axios.delete(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'X-XSRF-TOKEN': decodeURIComponent(token),
      },
      withCredentials: true,
    })
    isEditModalOpen.value = false
    router.push('/users')
  } catch (e) {
    alert('Ошибка при удалении пользователя')
  }
}

const isEditing = ref(false)
const editForm = ref({
  fullName: '',
  email: '',
  position: '',
  room: '', // добавлено поле room
})

function startEdit() {
  if (!user.value) return
  editForm.value = {
    fullName: user.value.fullName || '',
    email: user.value.email || '',
    position: user.value.position || '',
    room: user.value.room || '', // инициализация room
  }
  isEditing.value = true
}

function cancelUserEdit() {
  isEditing.value = false
  // Возвращаем значения из user
  editForm.value = {
    fullName: user.value.fullName || '',
    email: user.value.email || '',
    position: user.value.position || '',
    room: user.value.room || '', // сброс room
  }
}

const userChangedMessage = ref('')

async function saveUserEdit() {
  userChangedMessage.value = ''
  try {
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')
    const prevUser = { ...user.value }
    let data, headers
    if (selectedAvatar.value) {
      data = new FormData()
      data.append('fullName', editForm.value.fullName)
      data.append('email', editForm.value.email)
      data.append('position', editForm.value.position)
      data.append('room', editForm.value.room)
      data.append('avatar', selectedAvatar.value)
      headers = {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    } else {
      data = {
        fullName: editForm.value.fullName,
        email: editForm.value.email,
        position: editForm.value.position,
        room: editForm.value.room,
      }
      headers = {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
      }
    }
    await axios.put(`/api/users/${userId}`, data, headers)
    isEditing.value = false
    selectedAvatar.value = null
    await fetchUserDetails()
    await fetchItems(currentPage.value)
    if (operations.value.length > 0 && operations.value[0].action === 'user_updated') {
      userChangedMessage.value = operations.value[0].description
    } else {
      userChangedMessage.value = 'Данные пользователя успешно обновлены'
    }
  } catch (e) {
    userChangedMessage.value = ''
    alert('Ошибка при сохранении пользователя: ' + (e.response?.data?.message || e.message))
  }
}

const isAdmin = computed(() => userRole.value === 'admin')

const canEdit = computed(() => {
  // Только админ или сам пользователь может редактировать
  return isAdmin.value || (currentUserId.value && userId == currentUserId.value)
})

function handleSelectedItemsClick(selected) {
  // Ваша логика для выделенной техники
  alert('Выделено ТМЦ: ' + selected.length)
  alert('Выделено техники: ' + selected.length)
}

const avatarInput = ref(null)
const selectedAvatar = ref(null)
function triggerAvatarSelect() {
  if (avatarInput.value) avatarInput.value.click()
}
function onAvatarChange(e) {
  const file = e.target.files && e.target.files[0]
  if (file) {
    selectedAvatar.value = file
    // Для предпросмотра можно использовать URL.createObjectURL(file)
    user.value.avatar_path = URL.createObjectURL(file)
  }
}
</script>
