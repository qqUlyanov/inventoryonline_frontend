<template>
  <div
    :class="[
      overlay
        ? 'fixed top-0 left-0 h-screen w-64 z-50 bg-[#000000f1] text-white flex flex-col transition-all duration-300 ease-in-out'
        : 'h-screen bg-[#000000f1] text-white transition-all duration-300 ease-in-out flex flex-col relative z-10',
      isOpen ? 'w-64' : 'w-16',
    ]"
    style="box-shadow: 6px 0 12px rgba(0, 0, 0, 0.25)"
  >
    <!-- Крестик для overlay -->
    <button
      v-if="overlay"
      class="absolute top-4 right-4 text-2xl text-gray-300 hover:text-white z-50"
      @click="$emit('close')"
    >
      <i class="ri-close-line"></i>
    </button>

    <!-- Аватар и имя -->
    <router-link
      to="/profile"
      class="h-16 flex items-center w-full px-4 transition-colors"
      :class="[
        isProfileActive
          ? 'bg-[#85858550] text-white'
          : 'text-gray-300 hover:bg-[#85858520] hover:text-white',
      ]"
    >
      <div class="w-6 flex justify-center">
        <div
          class="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
          :style="avatarStyle"
        >
          <img
            v-if="user?.avatar_path"
            :src="user.avatar_path"
            alt="Аватар"
            style="width: 100%; height: 100%; object-fit: cover"
          />
        </div>
      </div>
      <span
        v-if="isOpen"
        class="font-semibold whitespace-nowrap overflow-hidden text-ellipsis ml-4"
      >
        {{ user?.fullName || 'Загрузка...' }}
      </span>
    </router-link>

    <!-- Навигация -->
    <nav class="flex flex-col gap-1 flex-1 w-full">
      <SidebarItem
        to="/"
        icon="ri-database-2-line"
        label="Список техники"
        :is-open="isOpen"
        :exact="true"
      />
      <SidebarItem to="/analytics" icon="ri-bar-chart-line" label="Аналитика" :is-open="isOpen" />
      <SidebarItem
        to="/users"
        icon="ri-user-settings-line"
        label="Пользователи"
        :is-open="isOpen"
      />
    </nav>
  </div>
</template>

<script setup>
import SidebarItem from './SidebarItem.vue'
import { useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  isOpen: Boolean,
  overlay: Boolean,
})

const emit = defineEmits(['toggle'])

const route = useRoute()
const isProfileActive = computed(() => route.path.startsWith('/profile'))

const user = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get('/api/user', { withCredentials: true })
    user.value = response.data
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error)
  }
})

// Стиль по умолчанию: серый фон, если нет аватара
const avatarStyle = computed(
  () =>
    user.value?.avatar_path
      ? {} // если есть avatar_path, ничего не нужно (будет <img>)
      : { backgroundColor: '#6b7280' }, // серый фон Tailwind gray-500
)
</script>
