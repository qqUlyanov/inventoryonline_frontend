<template>
  <header
    class="flex items-center justify-between h-16 px-4 bg-[#000000f1] text-white"
    style="box-shadow: 0 10px 8px rgba(0, 0, 0, 0.15)"
  >
    <!-- Левая часть: бургер и заголовок -->
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <!-- Бургер-кнопка всегда видна, кроме overlaySidebar -->
      <button
        v-if="!overlaySidebar"
        @click="$emit('toggle-sidebar')"
        class="text-2xl text-white hover:text-gray-300 transition-colors focus:outline-none block"
        aria-label="Открыть/Свернуть меню"
        style="z-index: 20"
      >
        ☰
      </button>
      <h1 class="text-xl font-semibold truncate">{{ pageTitle }}</h1>
    </div>

    <!-- Правая часть: уведомления -->
    <div class="flex items-center gap-4 flex-shrink-0 pr-2">
      <div class="relative">
        <i
          class="ri-notification-3-line"
          :style="{ fontSize: '25px', color: 'white', cursor: 'pointer' }"
          @click="openNotificationsModal"
        ></i>
        <span
          v-if="unreadCount > 0"
          :class="[
            'absolute -top-2 -right-2 bg-red-600 text-white text-xs flex items-center justify-center animate-bounce-slow',
            'notification-badge',
          ]"
          style="pointer-events: none; z-index: 10;"
          >{{ unreadCount }}</span
        >
      </div>
    </div>

    <!-- Модалка уведомлений -->
    <transition name="fade">
      <div
        v-if="showNotifications"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        @click.self="closeNotificationsModal"
      >
        <div
          class="bg-white shadow-2xl w-full max-w-lg relative flex flex-col animate-fade-in"
          style="border-radius: 1rem; overflow: hidden"
        >
          <!-- Заголовок и описание -->
          <div
            class="flex items-center justify-between px-6 pt-6 pb-2 border-b bg-white z-10"
            style="position: sticky; top: 0"
          >
            <h2 class="text-xl font-bold flex items-center gap-2 text-gray-900">
              <i class="ri-notification-3-line text-blue-500"></i>
              Уведомления
            </h2>
            <button
              class="text-gray-400 hover:text-gray-700 text-2xl"
              @click="closeNotificationsModal"
              aria-label="Закрыть"
            >
              &times;
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4 max-h-[60vh]">
            <div v-if="loadingNotifications" class="space-y-3">
              <div v-for="i in 5" :key="i" class="flex items-center gap-3 animate-pulse">
                <div class="w-6 h-6 rounded-full bg-gray-200"></div>
                <div class="flex-1">
                  <div class="h-3 w-3/4 bg-gray-200 rounded mb-1"></div>
                  <div class="h-2 w-1/3 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
            <div v-else-if="notifications.length === 0" class="text-center text-gray-400 py-8">
              <i class="ri-notification-off-line text-2xl mb-2"></i>
              <div>Нет уведомлений</div>
            </div>
            <ul v-else class="space-y-3">
              <li
                v-for="notif in notificationsToShow"
                :key="notif.id"
                :class="[
                  'border-b pb-2 flex items-start gap-3 cursor-pointer px-3 py-2 rounded-xl transition',
                  notif.read_at ? 'bg-white hover:bg-blue-50' : 'bg-blue-50 hover:bg-blue-100',
                ]"
                @click="goToRequest(notif)"
              >
                <div class="pt-1">
                  <i
                    :class="
                      notif.read_at
                        ? 'ri-notification-3-line text-gray-400'
                        : 'ri-notification-3-fill text-blue-500'
                    "
                    class="text-lg"
                  ></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div
                    :class="[
                      'text-sm break-words',
                      notif.read_at ? 'text-gray-900' : 'text-blue-900 font-semibold',
                    ]"
                  >
                    {{ notif.text || notif.message }}
                    <span
                      v-if="!notif.read_at"
                      class="ml-2 inline-block px-2 py-0.5 text-xs bg-blue-200 text-blue-800 rounded align-middle"
                      >Новое</span
                    >
                  </div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>{{ formatDate(notif.created_at) }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
defineEmits(['toggle-sidebar'])

import { ref, computed, onMounted, defineProps, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Cookies from 'js-cookie'

const props = defineProps({
  pageTitle: String,
})
const route = useRoute()
const router = useRouter()
const loadingNotifications = ref(false)
const notifications = ref([])
const showNotifications = ref(false)
const notificationsLoaded = ref(false)
const isSidebarOpen = inject('isSidebarOpen', null)
const overlaySidebar = inject('overlaySidebar', null)
const windowWidth = inject('windowWidth', ref(window.innerWidth))

const pageTitle = computed(() => {
  switch (route.name) {
    case 'home':
      return 'Список техники'
    case 'users':
      return 'Пользователи'
    case 'analytics':
      return 'Аналитика'
    case 'profile':
      return 'Личный кабинет'
    default:
      return 'Панель'
  }
})

const unreadCount = computed(() => notifications.value.filter((n) => !n.read_at).length)
const notificationsToShow = computed(() => notifications.value)

async function fetchNotifications() {
  loadingNotifications.value = true
  try {
    const resp = await axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    notifications.value = Array.isArray(resp.data) ? resp.data : []
  } catch (e) {
    notifications.value = []
  } finally {
    loadingNotifications.value = false
  }
}

async function markAllNotificationsRead() {
  if (unreadCount.value > 0) {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true })
      const token = Cookies.get('XSRF-TOKEN')
      await axios.post(
        '/api/notifications/read',
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'X-XSRF-TOKEN': decodeURIComponent(token),
          },
          withCredentials: true,
        },
      )
      notifications.value = notifications.value.map((n) => ({
        ...n,
        read_at: n.read_at || new Date().toISOString(),
      }))
    } catch (e) {
      // ignore
    }
  }
}

async function openNotificationsModal() {
  showNotifications.value = true
  if (!notificationsLoaded.value) {
    await fetchNotifications()
    notificationsLoaded.value = true
  }
}

function closeNotificationsModal() {
  showNotifications.value = false
  markAllNotificationsRead()
}

// Сделать функцию глобально доступной для обновления уведомлений из других компонентов
onMounted(() => {
  fetchNotifications()
  window.fetchNotifications = fetchNotifications
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

function goToRequest(notif) {
  // Универсально ищем id заявки
  const id =
    notif.asset_request_id ||
    notif.request_id ||
    notif.requestId ||
    (notif.data && (notif.data.asset_request_id || notif.data.request_id || notif.data.requestId))
  if (id) {
    showNotifications.value = false
    markAllNotificationsRead() // сбрасываем счетчик сразу при переходе
    // Используем имя маршрута, если он определён в роутере
    router.push({ name: 'AssetRequestDetail', params: { id: id.toString() } })
    // Обновить уведомления после перехода
    setTimeout(fetchNotifications, 500)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-fade-in {
  animation: fadeInModal 0.25s;
}
@keyframes fadeInModal {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Короткая анимация bounce для бейджа */
@keyframes bounceShort {
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1.25);
  }
  40% {
    transform: scale(0.95);
  }
  60% {
    transform: scale(1.15);
  }
  80% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}
.animate-bounce-short {
  animation: bounceShort 1s infinite;
}
@keyframes bounceSlow {
  0% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.18);
  }
  20% {
    transform: scale(0.97);
  }
  30% {
    transform: scale(1.12);
  }
  40% {
    transform: scale(0.99);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
}
.animate-bounce-slow {
  animation: bounceSlow 2.5s infinite;
}
.notification-badge {
  width: 22px;
  height: 22px;
  min-width: 22px;
  min-height: 22px;
  border-radius: 50%;
  padding: 0;
  line-height: 22px;
  text-align: center;
  font-weight: 600;
  box-sizing: border-box;
}
</style>
