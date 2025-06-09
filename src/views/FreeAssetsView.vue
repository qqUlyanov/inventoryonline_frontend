<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Свободная техника</h1>
    <div v-if="loading" class="text-center py-10 text-gray-400">Загрузка...</div>
    <div v-else>
      <div class="mb-4 flex gap-4 items-center">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по названию, инв. номеру, типу..."
          class="border rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition whitespace-nowrap"
        >
          + Добавить технику
        </button>
      </div>
      <CreateItemModal
        v-model="showCreateModal"
        :default-status="'Свободен'"
        :default-user-id="null"
        :default-room="null"
        @create="handleCreate"
      />
      <div v-if="filteredAssets.length === 0" class="text-center text-gray-500">
        Свободная техника отсутствует
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm bg-white rounded-xl overflow-hidden shadow">
          <thead>
            <tr class="bg-gray-100 border-b">
              <th class="px-3 py-2 text-left">Фото</th>
              <th class="px-3 py-2 text-left">Инв. номер</th>
              <th class="px-3 py-2 text-left">Название</th>
              <th class="px-3 py-2 text-left">Тип</th>
              <th class="px-3 py-2 text-left">Бренд</th>
              <th class="px-3 py-2 text-left">Кабинет</th>
              <th class="px-3 py-2 text-left">Цена</th>
              <th class="px-3 py-2 text-left">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="border-b hover:bg-blue-50 cursor-pointer"
            >
              <td class="px-3 py-2">
                <img
                  v-if="asset.photo"
                  :src="asset.photo"
                  class="w-12 h-12 rounded object-cover border"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-300 border"
                >
                  <i class="ri-image-line text-2xl"></i>
                </div>
              </td>
              <td class="px-3 py-2 font-semibold">{{ asset.inv_number }}</td>
              <td class="px-3 py-2">{{ asset.name }}</td>
              <td class="px-3 py-2">{{ asset.type || '—' }}</td>
              <td class="px-3 py-2">{{ asset.brand || '—' }}</td>
              <td class="px-3 py-2">{{ asset.room || '—' }}</td>
              <td class="px-3 py-2">{{ asset.price ? asset.price + ' ₽' : '—' }}</td>
              <td class="px-3 py-2">
                <span
                  class="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-100"
                  >{{ asset.status }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import CreateItemModal from '@/components/CreateItemModal.vue'

const freeAssets = ref([])
const loading = ref(true)
const search = ref('')
const showCreateModal = ref(false)

const filteredAssets = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return freeAssets.value
  return freeAssets.value.filter((asset) => {
    return (
      (asset.inv_number && asset.inv_number.toLowerCase().includes(q)) ||
      (asset.name && asset.name.toLowerCase().includes(q)) ||
      (asset.type && asset.type.toLowerCase().includes(q)) ||
      (asset.brand && asset.brand.toLowerCase().includes(q)) ||
      (asset.room && asset.room.toLowerCase().includes(q))
    )
  })
})

onMounted(async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/assets', {
      params: { status: 'Свободен' },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    // Поддержка разных форматов ответа
    if (Array.isArray(response.data.data)) {
      freeAssets.value = response.data.data
    } else if (Array.isArray(response.data)) {
      freeAssets.value = response.data
    } else {
      freeAssets.value = []
    }
  } catch (e) {
    freeAssets.value = []
  } finally {
    loading.value = false
  }
})

function handleCreate(newItem) {
  freeAssets.value.unshift(newItem)
}
</script>

<style scoped>
/* Добавьте свои стили, если необходимо */
</style>
