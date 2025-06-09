<template>
  <div class="p-2 xs:p-3 sm:p-4 md:p-6 relative h-full min-h-[calc(100vh-4rem)]">
    <!-- Карточки статистики -->
    <div class="space-y-6 mb-6">
      <div
        class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3"
      >
        <template v-if="isStatsLoading">
          <div
            v-for="i in 4"
            :key="i"
            :class="[
              'relative p-2 xs:p-2 sm:p-4 rounded-2xl bg-gray-200 h-20 xs:h-24 sm:h-28 md:h-32 flex flex-col justify-between overflow-hidden',
              i === 3 && windowWidth < 768 ? 'hidden' : '',
              i === 4 && windowWidth < 1024 ? 'hidden' : '',
            ]"
          >
            <div class="absolute inset-0 bg-black/10 rounded-2xl"></div>
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div class="h-4 xs:h-5 sm:h-6 w-1/2 bg-gray-300 rounded mb-2"></div>
              <div class="h-7 xs:h-8 sm:h-10 w-1/3 bg-gray-300 rounded mb-2"></div>
              <div class="h-3 xs:h-4 sm:h-5 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            class="relative p-2 xs:p-2 sm:p-4 rounded-2xl shadow-sm text-white bg-[url('/images/office_4.jpg')] bg-cover bg-center overflow-hidden transition-opacity duration-500 h-20 xs:h-24 sm:h-28 md:h-32 text-xs xs:text-sm sm:text-base"
          >
            <div class="absolute inset-0 bg-black opacity-50 rounded-2xl"></div>
            <div class="relative z-10 text-xs xs:text-sm sm:text-base font-medium truncate">
              Общая стоимость
            </div>
            <div
              class="mt-1 sm:mt-2 text-base xs:text-lg sm:text-2xl font-semibold relative z-10 truncate"
            >
              {{ stats.total_cost }}
              <span class="text-xs xs:text-sm sm:text-base font-normal">RUB</span>
            </div>
            <div class="text-xs xs:text-sm sm:text-base mt-1 relative z-10 truncate">
              Учитывая всю технику
            </div>
          </div>
          <div
            class="relative p-2 xs:p-2 sm:p-4 rounded-2xl shadow-sm text-white bg-[url('/images/office_5.jpg')] bg-cover bg-center overflow-hidden transition-opacity duration-500 h-20 xs:h-24 sm:h-28 md:h-32 text-xs xs:text-sm sm:text-base"
          >
            <div class="absolute inset-0 bg-black opacity-50 rounded-2xl"></div>
            <div class="relative z-10 text-xs xs:text-sm sm:text-base font-medium truncate">
              Всего техники
            </div>
            <div
              class="mt-1 sm:mt-2 text-base xs:text-lg sm:text-2xl font-semibold relative z-10 truncate"
            >
              {{ stats.total }}
              <span class="text-xs xs:text-sm sm:text-base font-normal">Техника</span>
            </div>
            <div class="text-xs xs:text-sm sm:text-base mt-1 relative z-10 truncate">
              Учитывая всю технику
            </div>
          </div>
          <div
            class="relative p-1 xs:p-2 sm:p-4 rounded-2xl shadow-sm text-white bg-[url('/images/office_6.jpg')] bg-cover bg-center overflow-hidden transition-opacity duration-500 h-20 xs:h-24 sm:h-28 md:h-32 text-xs xs:text-sm sm:text-base"
            :class="{ hidden: windowWidth < 768 }"
          >
            <div class="absolute inset-0 bg-black opacity-50 rounded-2xl"></div>
            <div class="relative z-10 text-xs xs:text-sm sm:text-base font-medium truncate">
              В сервисе
            </div>
            <div
              class="mt-1 sm:mt-2 text-base xs:text-lg sm:text-2xl font-semibold relative z-10 truncate"
            >
              {{ stats.in_repair }}
              <span class="text-xs xs:text-sm sm:text-base font-normal">Техника</span>
            </div>
            <div class="text-xs xs:text-sm sm:text-base mt-1 relative z-10 truncate">
              В данный момент в сервисе
            </div>
          </div>
          <div
            class="relative p-1 xs:p-2 sm:p-4 rounded-2xl shadow-sm text-white bg-[url('/images/office_7.jpg')] bg-cover bg-center overflow-hidden transition-opacity duration-500 h-20 xs:h-24 sm:h-28 md:h-32 text-xs xs:text-sm sm:text-base"
            :class="{ hidden: windowWidth < 1024 }"
          >
            <div class="absolute inset-0 bg-black opacity-50 rounded-2xl"></div>
            <div class="relative z-10 text-xs xs:text-sm sm:text-base font-medium truncate">
              Ожидают обновления статуса
            </div>
            <div
              class="mt-1 sm:mt-2 text-base xs:text-lg sm:text-2xl font-semibold relative z-10 truncate"
            >
              {{ stats.awaiting_update }}
              <span class="text-xs xs:text-sm sm:text-base font-normal">Техника</span>
            </div>
            <div class="text-xs xs:text-sm sm:text-base mt-1 relative z-10 truncate">
              В данный момент ожидают обновления статуса
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Таблица -->
    <div class="bg-white rounded-xl shadow-sm relative overflow-visible">
      <TableToolbar
        :search-value="searchQuery"
        :is-admin="isAdmin"
        @update:search="searchQuery = $event"
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
          />
        </template>
        <template v-if="isAdmin" #create-modal>
          <CreateItemModal v-model="showCreateModal" @create="handleCreate" />
        </template>
        <template v-if="isAdmin" #upload-modal>
          <ModalUpload v-model="showUploadModal" @update:modelValue="onUploadClose" />
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

      <!-- Загрузка (skeleton) -->
      <template v-if="isLoading">
        <div
          v-for="n in 10"
          :key="n"
          class="grid grid-cols-[40px_80px_110px_150px_1.7fr_repeat(5,1fr)] px-4 py-3 border-b animate-pulse"
        >
          <div class="h-6 bg-gray-200 rounded col-span-full"></div>
        </div>
      </template>

      <!-- Таблица техники через компонент -->
      <AssetTable
        v-else
        :items="items"
        :selectable="true"
        v-model="selectedItems"
        :users-list="usersList"
        @rowClick="goToItemDetail"
        @selectedItemsClick="handleSelectedItemsClick"
        @reportSelected="handleReportSelected"
        @requestSubmit="handleRequestSubmit"
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import CreateItemModal from '@/components/CreateItemModal.vue'
import ModalUpload from '@/components/ModalUpload.vue'
import ModalFilter from '@/components/ModalFilter.vue'
import ModalDownload from '@/components/ModalDownload.vue'
import AssetTable from '@/components/AssetTable.vue'
import TableToolbar from '@/components/TableToolbar.vue'

const router = useRouter()
const route = useRoute()

const stats = ref({
  total_cost: 0,
  total: 0,
  in_repair: 0,
  awaiting_update: 0,
})
const isStatsLoading = ref(true)
const userId = ref(null)

const allUserAssets = ref([]) // <--- добавлено

const totalPrice = ref(0)
const items = ref([])
const serviceCount = ref(0)
const writtenOffCount = ref(0)
const searchQuery = ref('')
const showFilterModal = ref(false)
const showCreateModal = ref(false)
const showUploadModal = ref(false)
const showDownloadModal = ref(false)
const filters = ref({})
const selectedItems = ref([])
const isLoading = ref(true)
const uploadFile = ref(null)
const downloadFormat = ref('xlsx')
const isAdmin = ref(false)
const usersList = ref([])

const currentPage = ref(1)
const lastPage = ref(1)
const perPage = 20

const isSidebarOpen = inject('isSidebarOpen', ref(true))
const buttonStyle = computed(() => ({
  left: isSidebarOpen.value ? '16rem' : '4rem', // 16rem = 256px (w-64), 4rem = 64px (w-16)
  backdropFilter: 'blur(4px)',
}))

const filtersState = inject('filtersState', ref({}))

let isInternalFiltersUpdate = false

watch([filters, searchQuery], ([newFilters, newSearch]) => {
  if (!isInternalFiltersUpdate) {
    filtersState.value = { ...newFilters, search: newSearch }
  }
  isInternalFiltersUpdate = false
})

watch(filtersState, (val) => {
  if (Object.keys(val).length === 0) {
    isInternalFiltersUpdate = true
    filters.value = {}
    searchQuery.value = ''
    fetchItems(1)
  }
})

const fetchItems = async (page = 1) => {
  try {
    isLoading.value = true
    const params = { page, per_page: perPage, ...filters.value }
    if (searchQuery.value) {
      params.name = searchQuery.value
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

    totalPrice.value = items.value.reduce((acc, item) => {
      const price = Number(item.price) || 0
      return acc + price
    }, 0)

    serviceCount.value = items.value.filter((item) => item.status === 'В ремонте').length
    writtenOffCount.value = items.value.filter((item) => item.status === 'Об. статуса').length
  } catch (error) {
    console.error('Ошибка при получении данных:', error)
  } finally {
    isLoading.value = false
  }
}

// Получаем id пользователя
async function fetchUserId() {
  const userResp = await axios.get('/api/user', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  userId.value = userResp.data.id
}

// Получаем все asset пользователя (без пагинации) для статистики карточек
async function fetchAllUserAssetsStats() {
  isStatsLoading.value = true
  try {
    // Получаем все активы пользователя (без пагинации)
    // Используем endpoint без пагинации: /api/users/{user}/assets-all
    const response = await axios.get(`/api/users/${userId.value}/assets-all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    // Ожидается массив всех asset пользователя
    const allAssets = Array.isArray(response.data) ? response.data : []

    stats.value.total_cost = allAssets.reduce((acc, item) => acc + (Number(item.price) || 0), 0)
    stats.value.total = allAssets.length
    stats.value.in_repair = allAssets.filter((item) => item.status === 'В ремонте').length
    stats.value.awaiting_update = allAssets.filter((item) => item.status === 'Об. статуса').length
  } catch (e) {
    stats.value = { total_cost: 0, total: 0, in_repair: 0, awaiting_update: 0 }
  } finally {
    isStatsLoading.value = false
  }
}

onMounted(async () => {
  await fetchUserId()
  await fetchAllUserAssetsStats()
  await fetchItems()
  const userAdminResp = await axios.get('/api/user')
  isAdmin.value = userAdminResp.data.role === 'admin'
  // Загружать список пользователей для всех, не только для админа
  const usersResp = await axios.get('/api/users-with-stats')
  usersList.value = usersResp.data

  window.addEventListener('resize', handleResize)

  // Устанавливаем pageTitle для NavBar, если он используется через provide/inject
  if (typeof window !== 'undefined') {
    window.pageTitle = 'Список техники'
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleCreate = (newItem) => {
  items.value.unshift(newItem)
  showCreateModal.value = false
  fetchItems(currentPage.value)
}

const goToItemDetail = (id) => {
  router.push({ name: 'AssetDetail', params: { id } })
}

const goToPage = (page) => {
  if (page >= 1 && page <= lastPage.value) {
    fetchItems(page)
  }
}

const updateFilters = (newFilters) => {
  filters.value = { ...newFilters }
  fetchItems(1)
}

watch(searchQuery, () => fetchItems(1))

function onFileChange(e) {
  uploadFile.value = e.target.files[0]
}

function handleUpload() {
  if (!uploadFile.value) {
    alert('Выберите файл для загрузки')
    return
  }
  showUploadModal.value = false
  uploadFile.value = null
  alert('Файл успешно загружен (заглушка)')
}

function handleDownload() {
  showDownloadModal.value = false
  alert(`Скачивание в формате ${downloadFormat.value} (заглушка)`)
}

function onUploadClose(val) {
  if (!val) {
    fetchItems(currentPage.value)
  }
}

function handleSelectedItemsClick(selected) {
  // Здесь ваша логика, например:
  alert('Выделено техники: ' + selected.length)
  // Можно открыть модалку, отправить на сервер и т.д.
}

function handleReportSelected(selected) {
  alert('Сформировать отчет по выделенной технике: ' + selected.length)
}

function handleRequestSubmit(payload) {
  // После оформления заявки сбрасываем выделенную технику
  selectedItems.value = []
  // Здесь ваша логика отправки заявки
}

const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}
</script>
