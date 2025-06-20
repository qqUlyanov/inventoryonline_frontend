<template>
  <div class="p-2 sm:p-6 space-y-6">
    <!-- Поиск и кнопка добавления пользователя -->
    <div class="flex flex-row justify-end items-center gap-2">
      <div class="flex flex-row gap-2 items-center">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по имени..."
          class="border rounded-xl px-4 py-2 w-40 xs:w-56 sm:w-80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          class="flex items-center justify-center gap-2 text-blue-600 px-4 py-2 rounded-xl bg-white border border-blue-100 hover:bg-blue-50 transition whitespace-nowrap"
          @click="showCreateUser = true"
        >
          <i class="ri-user-add-line text-2xl"></i>
          <span class="hidden xs:inline">Добавить</span>
        </button>
      </div>
    </div>

    <!-- Карточки пользователей -->
    <TransitionGroup
      name="list"
      tag="div"
      class="grid gap-3 xs:gap-4 grid-cols-2 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
      style="grid-auto-rows: 1fr"
    >
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        @click="goToUser(user.id)"
        @contextmenu.prevent="openContextMenu($event, user)"
        class="relative rounded-xl cursor-pointer overflow-hidden group text-white bg-cover bg-center flex flex-col aspect-[3/5] min-h-[120px] md:aspect-[3/4.2] md:min-h-[180px]"
        :style="`background-image: url('/images/${getBackground(user.position)}')`"
      >
        <!-- Затемнение и размытие -->
        <div
          class="absolute inset-0 bg-black/50 group-hover:backdrop-blur-sm transition duration-300"
        ></div>

        <!-- Контейнер с содержимым -->
        <div class="relative z-10 flex flex-col justify-between h-full p-2 sm:p-3">
          <!-- Верхний блок: аватар и кабинет -->
          <div class="flex justify-between items-start">
            <div
              class="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300 shrink-0"
            />
            <span class="text-xs text-white/80">Каб. №{{ user.room }}</span>
          </div>

          <!-- Нижний блок: имя и статистика -->
          <div class="flex flex-col gap-1 mt-auto user-info">
            <div
              class="user-name text-sm xs:text-base sm:text-lg font-medium leading-tight truncate"
              :title="user.fullName"
            >
              {{ user.fullName }}
            </div>
            <div class="user-stats flex gap-2 text-xs sm:text-sm flex-wrap">
              <div title="Всего"><i class="ri-database-2-line"></i> {{ user.stats.total }}</div>
              <div title="Ожидают обновления" class="text-blue-300">
                <i class="ri-time-line"></i> {{ user.stats.pending }}
              </div>
              <div title="В ремонте" class="text-red-300">
                <i class="ri-tools-line"></i> {{ user.stats.repair }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Контекстное меню -->
    <div
      v-if="contextMenu.visible"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-white border rounded shadow-lg min-w-[160px] py-2"
      @click="contextMenu.visible = false"
    >
      <button
        class="block w-full text-left px-4 py-2 hover:bg-gray-100"
        @click.stop="goToUser(contextMenu.user.id)"
      >
        Открыть профиль
      </button>
      <button
        class="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
        @click.stop="deleteUser(contextMenu.user)"
      >
        Удалить
      </button>
    </div>

    <CreateUserModal v-model="showCreateUser" @created="onUserCreated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import CreateUserModal from '@/components/CreateUserModal.vue'

const users = ref([])
const loading = ref(false)
const search = ref('')
const showCreateUser = ref(false)
const router = useRouter()
const windowWidth = ref(window.innerWidth)

function handleResize() {
  windowWidth.value = window.innerWidth
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
  fetchUsers()
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

async function fetchUsers() {
  loading.value = true
  try {
    const response = await axios.get('/api/users-with-stats', {
      params: { search: search.value },
    })
    users.value = Array.isArray(response.data) ? response.data : []
  } catch (e) {
    users.value = []
  } finally {
    loading.value = false
  }
}

function onUserCreated() {
  showCreateUser.value = false
  fetchUsers()
}

const filteredUsers = computed(() => {
  if (!search.value.trim()) return users.value
  return users.value.filter((user) => {
    const query = search.value.toLowerCase()
    return user.fullName.toLowerCase().includes(query) || user.room.toString().includes(query)
  })
})

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

function goToUser(id) {
  router.push(`/users/${id}`)
}

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  user: null,
})

function openContextMenu(event, user) {
  contextMenu.value.visible = true
  contextMenu.value.x = event.clientX
  contextMenu.value.y = event.clientY
  contextMenu.value.user = user
  document.addEventListener('click', closeContextMenu)
}
function closeContextMenu() {
  contextMenu.value.visible = false
  document.removeEventListener('click', closeContextMenu)
}

function deleteUser(user) {
  if (!confirm('Вы действительно хотите удалить этого пользователя?')) {
    contextMenu.value.visible = false
    return
  }
  axios.get('https://api.inventoryonline.ru/sanctum/csrf-cookie').then(() => {
    const token = localStorage.getItem('token')
    const xsrf = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]
    axios
      .delete(`/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-XSRF-TOKEN': xsrf ? decodeURIComponent(xsrf) : '',
        },
        withCredentials: true,
      })
      .then(() => {
        contextMenu.value.visible = false
        fetchUsers()
      })
      .catch(() => {
        alert('Ошибка при удалении пользователя')
        contextMenu.value.visible = false
      })
  })
}
</script>

<style scoped>
/* Анимация появления карточек */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.list-enter-to {
  opacity: 1;
  transform: scale(1);
}
.list-leave-from {
  opacity: 1;
  transform: scale(1);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 0.25rem;
}

.user-name {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.user-stats {
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.5rem;
}
</style>
