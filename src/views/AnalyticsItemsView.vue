<template>
  <div class="p-6 space-y-6 relative">
    <!-- Поиск -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0"
    >
      <h1 class="text-xl sm:text-2xl font-bold">Вся техника</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Поиск по названию или инв. номеру..."
        class="border rounded-xl px-4 py-2 w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
    </div>
    <!-- Список таблиц по пользователям -->
    <TransitionGroup name="fade" tag="div" class="space-y-8">
      <template v-if="loading && page === 1">
        <div v-for="n in 3" :key="n" class="space-y-4">
          <div class="flex items-center gap-4 mb-2">
            <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div class="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div class="rounded-xl bg-gray-100 h-32 animate-pulse"></div>
        </div>
      </template>
      <template v-else>
        <div v-for="user in users" :key="user.id" class="space-y-4">
          <!-- Заголовок пользователя -->
          <div class="flex items-center gap-4 mb-2">
            <div class="flex items-center gap-2">
              <template v-if="user.avatar_path">
                <img
                  :src="user.avatar_path"
                  alt="Avatar"
                  class="w-10 h-10 rounded-full object-cover border cursor-pointer"
                  @click="goToUser(user.id)"
                />
              </template>
              <template v-else>
                <div
                  class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border cursor-pointer"
                  @click="goToUser(user.id)"
                >
                  <i class="ri-user-3-line text-2xl text-gray-400"></i>
                </div>
              </template>
              <div
                class="text-lg sm:text-xl font-semibold cursor-pointer"
                @click="goToUser(user.id)"
              >
                {{ user.fullName }}
              </div>
            </div>
          </div>
          <div v-if="userAssetsLoading[user.id] && (userAssetsPage[user.id] || 1) === 1">
            <div class="rounded-xl bg-gray-100 h-32 animate-pulse"></div>
          </div>
          <AssetTable
            v-else
            :items="userAssets[user.id] || []"
            @rowClick="goToItem"
            :hide-columns="hideColumns"
          />
          <!-- Кнопка "Развернуть" (если свернуто и есть доп. страницы) -->
          <div
            class="flex justify-center mt-2"
            v-if="
              collapsedUsers[user.id] &&
              !userAssetsLoading[user.id] &&
              (userAssetsHasMore[user.id] || userAssetsPage[user.id] > 1)
            "
          >
            <button
              class="flex items-center gap-2 px-4 py-1.5 text-blue-900 hover:text-blue-700 transition font-medium"
              @click="expandUserFull(user.id)"
            >
              <i class="ri-arrow-down-s-line"></i> Развернуть
            </button>
          </div>
        </div>
      </template>
    </TransitionGroup>
    <!-- Кнопка "Развернуть" для пагинации -->
    <div class="flex justify-center mt-6" v-if="hasMore && !(loading && page === 1)">
      <button
        class="flex items-center gap-2 px-4 py-1.5 text-white hover:text-blue-700 transition font-medium"
        @click="loadMore"
        :disabled="loading"
      >
        <span v-if="loading && page > 1"
          ><i class="ri-loader-4-line animate-spin"></i> Загрузка...</span
        >
        <span v-else>Развернуть</span>
      </button>
    </div>
    <!-- Кнопка сброса фильтров -->
    <button
      v-if="Object.keys(filters || {}).some((k) => filters[k])"
      @click="resetFilters"
      class="fixed left-8 bottom-8 z-50 bg-white border border-gray-300 shadow-lg px-5 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
      style="min-width: 160px"
    >
      <i class="ri-filter-off-line mr-2"></i> Сбросить фильтры
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AssetTable from '@/components/AssetTable.vue'

const router = useRouter()

const search = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')
const users = ref([])
const page = ref(1)
const perPage = 5
const hasMore = ref(true)
const loading = ref(false)
const filters = ref({})

const filtersState = inject('filtersState', ref({}))

watch(
  [filters, search],
  () => {
    filtersState.value = { ...filters.value, search: search.value }
  },
  { immediate: true },
)

watch(filtersState, (val) => {
  if (Object.keys(val).length === 0) {
    filters.value = {}
    search.value = ''
    fetchUsers(true)
  }
})

// Для пагинации активов каждого пользователя (серверная)
const assetsPerPage = 10
const userAssets = ref({}) // { [userId]: [assets] }
const userAssetsPage = ref({}) // { [userId]: pageNumber }
const userAssetsHasMore = ref({}) // { [userId]: bool }
const userAssetsLoading = ref({}) // { [userId]: bool }
const collapsedUsers = ref({}) // { [userId]: true/false }
const userAssetsAllLoaded = ref({}) // { [userId]: true/false }

async function fetchUserAssets(userId, reset = false) {
  if (userAssetsLoading.value[userId]) return
  userAssetsLoading.value = { ...userAssetsLoading.value, [userId]: true }
  try {
    const pageNum = reset ? 1 : userAssetsPage.value[userId] || 1
    const response = await axios.get(`/api/users/${userId}/assets`, {
      params: { page: pageNum, per_page: assetsPerPage, search: search.value },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = response.data
    if (reset) {
      userAssets.value = { ...userAssets.value, [userId]: data.data }
      userAssetsPage.value = { ...userAssetsPage.value, [userId]: 1 }
    } else {
      userAssets.value = {
        ...userAssets.value,
        [userId]: [...(userAssets.value[userId] || []), ...data.data],
      }
    }
    userAssetsHasMore.value = { ...userAssetsHasMore.value, [userId]: !!data.next_page_url }
    // Если нет next_page_url, значит все загружено
    if (!data.next_page_url) {
      userAssetsAllLoaded.value = { ...userAssetsAllLoaded.value, [userId]: true }
    }
  } catch (error) {
    userAssets.value = { ...userAssets.value, [userId]: [] }
    userAssetsHasMore.value = { ...userAssetsHasMore.value, [userId]: false }
    userAssetsAllLoaded.value = { ...userAssetsAllLoaded.value, [userId]: true }
  } finally {
    userAssetsLoading.value = { ...userAssetsLoading.value, [userId]: false }
  }
}

async function expandUserFull(userId) {
  collapsedUsers.value = { ...collapsedUsers.value, [userId]: false }
  userAssetsAllLoaded.value = { ...userAssetsAllLoaded.value, [userId]: false }
  // Загружаем все страницы до конца
  let pageNum = userAssetsPage.value[userId] || 1
  while (true) {
    await fetchUserAssets(userId, pageNum === 1)
    if (!userAssetsHasMore.value[userId]) break
    pageNum += 1
    userAssetsPage.value = { ...userAssetsPage.value, [userId]: pageNum }
  }
  userAssetsAllLoaded.value = { ...userAssetsAllLoaded.value, [userId]: true }
}

function collapseUser(userId) {
  // Свернуть: показываем только первую страницу
  userAssetsPage.value = { ...userAssetsPage.value, [userId]: 1 }
  userAssets.value = {
    ...userAssets.value,
    [userId]: userAssets.value[userId]?.slice(0, assetsPerPage) || [],
  }
  collapsedUsers.value = { ...collapsedUsers.value, [userId]: true }
  userAssetsAllLoaded.value = { ...userAssetsAllLoaded.value, [userId]: false }
}

async function fetchUsers(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    const response = await axios.get('/api/users-with-stats', {
      params: { page: page.value, per_page: perPage, search: search.value },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = response.data
    if (reset) {
      users.value = data // <-- используем массив напрямую
    } else {
      users.value = [...users.value, ...data]
    }
    hasMore.value = false // пагинации нет, т.к. сервер возвращает весь массив
    // Для новых пользователей сразу загружаем первую страницу их активов
    users.value.forEach((u) => {
      if (!userAssets.value[u.id]) fetchUserAssets(u.id, true)
      if (collapsedUsers.value[u.id] === undefined) collapsedUsers.value[u.id] = true
      if (userAssetsAllLoaded.value[u.id] === undefined) userAssetsAllLoaded.value[u.id] = false
    })
  } catch (error) {
    users.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers(true)
})

function loadMore() {
  page.value += 1
  fetchUsers()
}

watch(search, () => {
  page.value = 1
  fetchUsers(true)
})

const sortedItems = (items) => {
  if (!Array.isArray(items) || !sortKey.value) return items || []
  return [...items].sort((a, b) => {
    const valueA = a[sortKey.value]
    const valueB = b[sortKey.value]
    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
}

const goToItem = (itemId) => {
  router.push({ name: 'AssetDetail', params: { id: itemId } })
}

function goToUser(id) {
  router.push(`/users/${id}`)
}

function resetFilters() {
  filters.value = {}
  // Можно также сбросить поиск, если нужно:
  // search.value = ''
  fetchUsers(true)
}

const filteredUsers = computed(() => {
  if (!search.value.trim())
    // Показывать только пользователей, у которых есть хотя бы одна техника
    return users.value.filter((user) => Array.isArray(user.assets) && user.assets.length > 0)

  const query = search.value.toLowerCase()

  return users.value
    .map((user) => ({
      ...user,
      assets: Array.isArray(user.assets)
        ? user.assets.filter(
            (item) =>
              (item.name && item.name.toLowerCase().includes(query)) ||
              (item.inventoryNumber && item.inventoryNumber.toLowerCase().includes(query)) ||
              (item.inv_number && item.inv_number.toLowerCase().includes(query)),
          )
        : [],
    }))
    .filter((user) => Array.isArray(user.assets) && user.assets.length > 0)
})

const hideColumns = computed(() => {
  // Скрываем некоторые столбцы на мобильных
  if (window.innerWidth < 640) {
    return ['type', 'brand', 'room', 'updatedAt', 'price']
  }
  if (window.innerWidth < 768) {
    return ['type', 'updatedAt', 'price']
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
