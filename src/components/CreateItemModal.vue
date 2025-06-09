<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', false)"
    title="Добавить или выбрать свободную технику"
  >
    <div class="flex flex-col gap-4">
      <!-- Поиск и кнопка добавления -->
      <div class="flex gap-2 items-center mb-2">
        <input
          v-model="search"
          type="text"
          placeholder="Поиск по названию, инв. номеру, типу..."
          class="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          @click="showCreateForm = true"
          class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition whitespace-nowrap"
        >
          + Новая
        </button>
      </div>
      <!-- Список свободной техники -->
      <div v-if="!showCreateForm">
        <div v-if="loading" class="text-center py-6 text-gray-400">Загрузка...</div>
        <div v-else-if="filteredAssets.length === 0" class="text-center text-gray-500">
          Свободная техника отсутствует
        </div>
        <div v-else class="max-h-72 overflow-y-auto flex flex-col gap-1">
          <div
            v-for="asset in filteredAssets"
            :key="asset.id"
            class="flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-blue-50"
            :class="{ 'bg-blue-100': selectedAssetId === asset.id }"
            @click="selectedAssetId = asset.id"
          >
            <img
              v-if="asset.photo"
              :src="asset.photo"
              class="w-10 h-10 rounded object-cover border"
            />
            <div
              v-else
              class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 border"
            >
              <i class="ri-image-line text-xl"></i>
            </div>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0 w-full">
              <span class="font-medium truncate max-w-[90px]">{{ asset.inv_number }}</span>
              <span class="text-gray-500 text-xs truncate max-w-[120px]">{{ asset.name }}</span>
              <span class="text-gray-400 text-xs truncate max-w-[80px]"
                >Тип: {{ asset.type || '—' }}</span
              >
              <span class="text-gray-400 text-xs truncate max-w-[80px]"
                >Бренд: {{ asset.brand || '—' }}</span
              >
              <span class="text-gray-400 text-xs truncate max-w-[80px]"
                >Кабинет: {{ asset.room || '—' }}</span
              >
              <span class="text-gray-400 text-xs truncate max-w-[80px]"
                >Цена: {{ asset.price ? asset.price + ' ₽' : '—' }}</span
              >
            </div>
            <span class="ml-auto text-xs text-gray-400">{{ asset.status }}</span>
          </div>
        </div>
        <div class="flex justify-end mt-4 gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            @click="emit('update:modelValue', false)"
          >
            Отмена
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            :disabled="!selectedAssetId"
            @click="chooseAsset"
          >
            Выбрать
          </button>
        </div>
      </div>
      <!-- Форма создания новой техники -->
      <form v-else @submit.prevent="submitForm" class="flex flex-col gap-4">
        <input
          v-model="form.name"
          type="text"
          placeholder="Наименование"
          required
          class="px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          v-model="form.type"
          type="text"
          placeholder="Тип"
          required
          class="px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          v-model="form.brand"
          type="text"
          placeholder="Бренд"
          required
          class="px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          @change="onImageChange"
          class="px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          v-model="form.inv_number"
          type="text"
          placeholder="Инв. №"
          required
          class="px-4 py-2 border border-gray-300 rounded-md"
        />
        <div v-if="errorMessage" class="text-red-600 text-xs mt-1">{{ errorMessage }}</div>
        <input
          v-model.number="form.price"
          type="number"
          placeholder="Цена"
          required
          class="px-4 py-2 border border-gray-300 rounded-md"
        />
        <div v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>
        <div class="flex gap-2 justify-end mt-4">
          <button
            type="button"
            @click="showCreateForm = false"
            class="text-gray-500 hover:text-gray-700 text-sm"
          >
            Назад
          </button>
          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted, computed } from 'vue'
import axios from 'axios'
import BaseModal from './BaseModal.vue'
import Cookies from 'js-cookie'

const props = defineProps({
  modelValue: Boolean,
  targetUserId: {
    type: [String, Number],
    default: null,
  },
})
const emit = defineEmits(['update:modelValue', 'create'])

const search = ref('')
const showCreateForm = ref(false)
const loading = ref(false)
const freeAssets = ref([])
const selectedAssetId = ref(null)
const errorMessage = ref('')
const imageInput = ref(null)
const imageFile = ref(null)

const form = reactive({
  name: '',
  type: '',
  brand: '',
  image_path: '',
  inv_number: '',
  price: null,
})

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

async function fetchFreeAssets() {
  loading.value = true
  try {
    const response = await axios.get('/api/assets', {
      params: { status: 'Свободен' },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
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
}

onMounted(fetchFreeAssets)

// Получить id пользователя, которому назначать технику (авторизованный или выбранный)
async function getTargetUserId() {
  // 1. Если явно передан targetUserId (например, на странице пользователя) — используем его
  if (props.targetUserId) return props.targetUserId
  // 2. Пробуем взять из localStorage
  const userLS = localStorage.getItem('user')
  if (userLS) {
    try {
      const user = JSON.parse(userLS)
      if (user && user.id) return user.id
    } catch {}
  }
  // 3. Пробуем получить id через API (если пользователь авторизован)
  try {
    const resp = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (resp.data && resp.data.id) {
      // Сохраняем в localStorage для будущих обращений
      localStorage.setItem('user', JSON.stringify(resp.data))
      return resp.data.id
    }
  } catch {}
  // 4. Если не удалось определить id — возвращаем null
  return null
}

const chooseAsset = async () => {
  const asset = freeAssets.value.find((a) => a.id === selectedAssetId.value)
  if (asset) {
    try {
      const userId = getTargetUserId()
      let url = `/api/assets/${asset.id}`
      if (userId) {
        url += `?user_id=${userId}`
      }
      const token = Cookies.get('XSRF-TOKEN')
      const response = await axios.patch(
        url,
        { status: 'Используется' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'X-XSRF-TOKEN': decodeURIComponent(token),
          },
          withCredentials: true,
        },
      )
      emit('create', response.data)
      emit('update:modelValue', false)
      fetchFreeAssets()
    } catch (e) {
      alert('Ошибка назначения техники: ' + (e.response?.data?.message || e.message))
    }
  }
}

function onImageChange(e) {
  const file = e.target.files && e.target.files[0]
  if (file) {
    imageFile.value = file
  } else {
    imageFile.value = null
  }
}

async function submitForm() {
  errorMessage.value = ''
  // Валидация цены
  if (form.price === null || form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
    errorMessage.value = 'Укажите корректную цену (число, не меньше 0)'
    return
  }
  const userId = await getTargetUserId()
  if (!userId || isNaN(Number(userId))) {
    errorMessage.value = 'Ошибка: не определён пользователь для назначения техники. Пожалуйста, перезайдите в систему.'
    return
  }
  try {
    const token = Cookies.get('XSRF-TOKEN')
    let data
    let config = {
      withCredentials: true,
      headers: {
        'X-XSRF-TOKEN': decodeURIComponent(token),
      },
    }
    if (imageFile.value) {
      data = new FormData()
      data.append('name', form.name)
      data.append('type', form.type)
      data.append('brand', form.brand)
      data.append('inv_number', form.inv_number)
      data.append('price', Number(form.price))
      data.append('status', 'Используется')
      data.append('user_id', userId)
      data.append('room', '')
      data.append('photo', imageFile.value)
      config.headers['Content-Type'] = 'multipart/form-data'
    } else {
      data = {
        ...form,
        price: Number(form.price),
        status: 'Используется',
        user_id: userId,
        room: null,
      }
      if (!data.image_path) delete data.image_path
    }
    const response = await axios.post('/api/assets', data, config)
    emit('create', response.data)
    emit('update:modelValue', false)
    Object.keys(form).forEach((key) => (form[key] = key === 'price' ? null : ''))
    imageFile.value = null
    if (imageInput.value) imageInput.value.value = ''
    showCreateForm.value = false
    fetchFreeAssets()
  } catch (e) {
    // --- новый блок: явный вывод ошибок для user_id и других полей ---
    if (e.response?.data?.errors) {
      if (e.response.data.errors.user_id?.length) {
        errorMessage.value = 'Ошибка пользователя: ' + e.response.data.errors.user_id[0]
      } else if (e.response.data.errors.inv_number?.length) {
        errorMessage.value = 'Инв. номер: ' + e.response.data.errors.inv_number[0]
      } else if (e.response.data.errors.price?.length) {
        errorMessage.value = 'Цена: ' + e.response.data.errors.price[0]
      } else {
        errorMessage.value = Object.values(e.response.data.errors).flat().join('; ')
      }
    } else if (e.response?.data?.message) {
      errorMessage.value = e.response.data.message
    } else {
      errorMessage.value = 'Ошибка при добавлении техники: ' + e.message
    }
  }
}
</script>
