<template>
  <BaseModal
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', false)"
    title="Добавить пользователя"
  >
    <form @submit.prevent="submitForm" class="flex flex-col gap-4">
      <input
        v-model="form.name"
        type="text"
        placeholder="Имя"
        required
        class="px-4 py-2 border border-gray-300 rounded-md"
      />
      <input
        v-model="form.position"
        type="text"
        placeholder="Должность"
        class="px-4 py-2 border border-gray-300 rounded-md"
      />
      <input
        v-model="form.room"
        type="text"
        placeholder="Кабинет/комната"
        class="px-4 py-2 border border-gray-300 rounded-md"
      />
      <input
        v-model="form.email"
        type="email"
        placeholder="Email"
        required
        class="px-4 py-2 border border-gray-300 rounded-md"
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="Пароль"
        required
        class="px-4 py-2 border border-gray-300 rounded-md"
      />
      <input
        ref="avatarInput"
        type="file"
        accept="image/*"
        @change="onAvatarChange"
        class="px-4 py-2 border border-gray-300 rounded-md"
      />
      <div class="flex gap-2 justify-end mt-4">
        <button
          type="button"
          @click="emit('update:modelValue', false)"
          class="text-gray-500 hover:text-gray-700 text-sm"
        >
          Отмена
        </button>
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
        >
          Сохранить
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { reactive, ref, defineProps, defineEmits } from 'vue'
import axios from 'axios'
import BaseModal from './BaseModal.vue'
import Cookies from 'js-cookie'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'created'])

const form = reactive({
  name: '',
  position: '',
  room: '',
  email: '',
  password: '',
  avatar: null,
})

const avatarInput = ref(null)

function onAvatarChange(e) {
  form.avatar = e.target.files[0] || null
}

async function submitForm() {
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('position', form.position)
    formData.append('room', form.room)
    formData.append('email', form.email)
    formData.append('password', form.password)
    if (form.avatar) {
      formData.append('avatar', form.avatar)
    }
    const token = Cookies.get('XSRF-TOKEN')
    const response = await axios.post('/api/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-XSRF-TOKEN': decodeURIComponent(token || ''),
      },
      withCredentials: true,
    })
    emit('created', response.data)
    emit('update:modelValue', false)
    Object.keys(form).forEach((key) => (form[key] = ''))
    if (avatarInput.value) avatarInput.value.value = ''
  } catch (e) {
    alert('Ошибка при добавлении пользователя: ' + (e.response?.data?.message || e.message))
  }
}
</script>
