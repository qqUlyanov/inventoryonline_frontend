<template>
  <div class="p-6 flex flex-col gap-6 relative">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="flex flex-col gap-6 xl:col-span-1">
        <!-- Карточка профиля -->
        <div
          class="rounded-xl p-6 text-white flex flex-col items-center text-center bg-cover bg-center relative overflow-hidden min-h-[220px]"
          :style="{ backgroundImage: user.fullName ? `url('/images/${backgroundImage}')` : 'none' }"
        >
          <div
            class="absolute inset-0 bg-black/50 pointer-events-none rounded-xl"
            :class="!user.fullName ? 'bg-gray-200' : ''"
          ></div>
          <div
            class="mb-4 w-20 h-20 rounded-full bg-gray-300 z-10 flex items-center justify-center"
          >
            <template v-if="user.fullName">
              <span class="text-3xl font-bold text-white uppercase">
                {{
                  user.fullName
                    ? user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                    : ''
                }}
              </span>
            </template>
            <template v-else>
              <div class="w-full h-full rounded-full bg-gray-300 animate-pulse"></div>
            </template>
          </div>
          <div class="flex items-center gap-2 rounded-lg px-4 py-2 z-10 flex-col w-full">
            <span class="font-medium text-xl block min-h-[28px] w-full text-center">
              <span v-if="user.fullName">{{ user.fullName }}</span>
              <span v-else class="inline-block w-32 h-7 bg-gray-300 rounded animate-pulse"></span>
            </span>
            <span class="text-base text-white block min-h-[22px] w-full text-center">
              <span v-if="user.position">{{ user.position }}</span>
              <span v-else class="inline-block w-20 h-5 bg-gray-300 rounded animate-pulse"></span>
            </span>
          </div>
        </div>
        <!-- Инфо и редактирование -->
        <form
          class="rounded-xl p-4 bg-white flex flex-col gap-4 text-sm text-gray-700"
          @submit.prevent="saveEdit"
        >
          <div class="flex justify-between items-center">
            <span>Email</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.email"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="email"
                autofocus
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.email }}</span>
            </template>
          </div>
          <div class="flex justify-between items-center">
            <span>Должность</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.position"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="text"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.position }}</span>
            </template>
          </div>
          <div class="flex justify-between items-center">
            <span>ФИО</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.fullName"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="text"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.fullName }}</span>
            </template>
          </div>
          <div class="flex justify-between items-center">
            <span>Кабинет</span>
            <template v-if="isEditing && isAdmin">
              <input
                v-model="editForm.room"
                class="border rounded px-2 py-1 text-right w-2/3"
                type="text"
              />
            </template>
            <template v-else>
              <span class="text-right w-2/3 truncate">{{ user.room || '—' }}</span>
            </template>
          </div>
          <div class="flex gap-2 mt-2 justify-end">
            <button
              v-if="!isEditing && isAdmin"
              type="button"
              class="flex items-center gap-2 text-indigo-600 hover:underline"
              @click="startEdit"
            >
              <i class="ri-edit-line"></i> Редактировать
            </button>
            <template v-else>
              <button
                v-if="isEditing && isAdmin"
                type="button"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                @click="cancelEdit"
              >
                Отмена
              </button>
              <button
                v-if="isEditing && isAdmin"
                type="submit"
                class="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Сохранить
              </button>
            </template>
          </div>
        </form>
      </div>
      <div class="flex flex-col gap-6 xl:col-span-2"></div>
    </div>
    <button @click="logout" class="text-red-500 font-medium mb-6 hover:underline self-start">
      ВЫЙТИ
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

const user = ref({})
const isEditing = ref(false)
const editForm = ref({
  fullName: '',
  email: '',
  position: '',
  room: '',
})
const userRole = ref(null)
const router = useRouter()

onMounted(async () => {
  try {
    const response = await axios.get('/api/user', { withCredentials: true })
    user.value = response.data
    userRole.value = response.data.role
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error)
  }
})

const isAdmin = computed(() => userRole.value === 'admin')

function startEdit() {
  editForm.value = {
    fullName: user.value.fullName || '',
    email: user.value.email || '',
    position: user.value.position || '',
    room: user.value.room || '',
  }
  isEditing.value = true
}
function cancelEdit() {
  isEditing.value = false
}
async function saveEdit() {
  try {
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie')
    const token = Cookies.get('XSRF-TOKEN')
    await axios.put(
      `/api/users/${user.value.id}`,
      {
        fullName: editForm.value.fullName,
        email: editForm.value.email,
        position: editForm.value.position,
        room: editForm.value.room,
      },
      {
        withCredentials: true,
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
        },
      },
    )
    user.value = { ...user.value, ...editForm.value }
    isEditing.value = false
  } catch (e) {
    alert('Ошибка при сохранении профиля: ' + (e.response?.data?.message || e.message))
  }
}

const backgroundMap = {
  Учитель: 'teacher_bg.jpg',
  Библиотекарь: 'library_bg.jpg',
  Завуч: 'head_teacher_bg.jpg',
  Директор: 'director_bg.jpg',
  Охранник: 'security_bg.jpg',
  Повар: 'dining_room_bg.jpg',
  Секретарь: 'secretary_bg.jpg',
}
const backgroundImage = computed(() => {
  return backgroundMap[user.value.position] || 'default.jpg'
})

const logout = async () => {
  try {
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie')
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post(
      'http://api.inventoryonline.ru/logout',
      {},
      {
        headers: {
          'X-XSRF-TOKEN': decodeURIComponent(token),
        },
      },
    )
    localStorage.removeItem('sanctum_token')
    localStorage.removeItem('user')
    router.push('/login').then(() => {
      window.location.reload()
    })
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error)
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
