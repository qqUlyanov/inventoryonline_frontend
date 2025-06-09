<template>
  <router-link
    :to="to"
    class="group block transition-colors w-full"
    :class="[
      isActive
        ? 'bg-[#85858550] text-white'
        : 'text-gray-300 hover:bg-[#85858520] hover:text-white',
    ]"
  >
    <div class="flex items-center h-12 w-full px-4">
      <!-- Иконка как элемент <i> с классом -->
      <i :class="[icon, 'text-xl w-6 shrink-0 text-center']"></i>

      <!-- Текст с отступом только при открытии -->
      <span v-if="isOpen" class="truncate text-[15px] font-medium ml-4">
        {{ label }}
      </span>
    </div>
  </router-link>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  to: String,
  icon: String,
  label: String,
  isOpen: Boolean,
  exact: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

const isActive = computed(() => {
  return props.exact ? route.path === props.to : route.path.startsWith(props.to)
})
</script>
