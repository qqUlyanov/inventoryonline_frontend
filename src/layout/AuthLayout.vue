<template>
  <div class="min-h-screen bg-gray-100 relative">
    <!-- Логотип -->
    <div class="absolute top-2 left-2 text-4xl font-bold text-black select-none">
      Inventory_online
    </div>

    <!-- Контейнер с логином по центру -->
    <div class="flex items-center justify-center min-h-screen">
      <LoginView />
    </div>
  </div>
</template>

<script setup>
import LoginView from '@/views/LoginView.vue'
</script>
