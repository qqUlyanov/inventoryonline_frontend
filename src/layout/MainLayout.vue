<template>
  <div class="flex h-screen overflow-hidden relative">
    <!-- Сайдбар (desktop >=1024px) -->
    <SideBar v-if="windowWidth >= 1024" :is-open="isSidebarOpen" />

    <!-- Overlay Sidebar (mobile <1024px) -->
    <transition name="fade">
      <div v-if="windowWidth < 1024 && overlaySidebar" class="fixed inset-0 z-50 flex">
        <!-- Бэкдроп -->
        <div class="absolute inset-0 bg-black/40" @click="overlaySidebar = false"></div>
        <!-- Сайдбар поверх -->
        <SideBar
          :is-open="true"
          overlay
          @close="overlaySidebar = false"
          class="relative z-10 w-64"
        />
      </div>
    </transition>

    <!-- Контент -->
    <div class="flex flex-col flex-1 bg-gray-50 relative">
      <!-- Навбар -->
      <NavBar
        :page-title="pageTitle"
        :show-avatar-button="windowWidth < 1024 && !overlaySidebar"
        @open-overlay-sidebar="overlaySidebar = true"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Основной контент -->
      <main class="flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <!-- Кнопка сброса фильтров -->
          <button
            v-if="showResetButton"
            @click="resetAllFilters"
            class="absolute z-10 bottom-0 bg-white border border-gray-300 shadow-lg px-1 py-1 text-gray-700 hover:bg-gray-100 transition-all"
          >
            <i class="ri-filter-off-line mr-1"></i> Сбросить фильтры
          </button>
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, onUnmounted, computed, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import SideBar from '@/layout/SideBar.vue'
import NavBar from '@/layout/NavBar.vue'

// Состояние сайдбара
const isSidebarOpen = ref(true)
const overlaySidebar = ref(false)
const windowWidth = ref(window.innerWidth)

provide('isSidebarOpen', isSidebarOpen)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  updateWindowWidth()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

// Автоматически закрывать сайдбар на узких экранах
watchEffect(() => {
  if (windowWidth.value < 1024) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
    overlaySidebar.value = false
  }
})

// Заголовок страницы
const route = useRoute()

const pageTitle = computed(() => {
  return route.name === 'profile'
    ? 'Личный кабинет'
    : route.name === 'home'
      ? 'Список техники'
      : route.name === 'inventory'
        ? 'Инвентарь'
        : route.name === 'settings'
          ? 'Настройки'
          : ''
})

// Закрывать overlaySidebar при переходе на другую страницу
watch(route, () => {
  overlaySidebar.value = false
})

// Глобальное состояние фильтров
const filtersState = ref({})
const showResetButton = computed(() => Object.values(filtersState.value).some((val) => !!val))
provide('filtersState', filtersState)
provide('resetAllFilters', resetAllFilters)

function resetAllFilters() {
  // Сбросить все фильтры (каждая страница должна слушать filtersState и сбрасывать свои фильтры)
  filtersState.value = {}
  // Можно также вызвать кастомные события или использовать глобальный eventBus для оповещения страниц
}

function toggleSidebar() {
  if (windowWidth.value < 1024) {
    isSidebarOpen.value = false
    overlaySidebar.value = !overlaySidebar.value
  } else {
    isSidebarOpen.value = !isSidebarOpen.value
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
