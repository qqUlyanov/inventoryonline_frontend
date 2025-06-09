<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="close" title="Загрузка техники">
    <form @submit.prevent="handleUpload" class="flex flex-col gap-4 items-center">
      <label
        for="upload-file"
        class="flex flex-col items-center justify-center w-32 h-32 cursor-pointer hover:bg-teal-50 transition"
      >
        <i class="ri-upload-cloud-2-line text-7xl text-teal-400 mb-2"></i>
        <span class="text-xs text-gray-500 text-center"
          >Выберите файл<br />(.xlsx, .xls, .csv)</span
        >
        <input
          id="upload-file"
          type="file"
          @change="onFileChange"
          accept=".xlsx,.xls,.csv"
          class="hidden"
        />
      </label>
      <div v-if="uploadFile" class="text-xs text-gray-700 mt-2 truncate max-w-[200px]">
        {{ uploadFile.name }}
      </div>
    </form>
    <template #footer>
      <button type="button" @click="close" class="text-gray-500 hover:text-gray-700 text-sm">
        Отмена
      </button>
      <button
        type="button"
        @click="handleUpload"
        class="bg-teal-600 text-white px-4 py-1.5 rounded hover:bg-teal-700 text-sm"
      >
        Загрузить
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
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
const emit = defineEmits(['update:modelValue'])

const uploadFile = ref(null)

function onFileChange(e) {
  uploadFile.value = e.target.files[0]
}

async function handleUpload() {
  if (!uploadFile.value) {
    alert('Выберите файл для загрузки')
    return
  }
  const formData = new FormData()
  formData.append('file', uploadFile.value)
  if (props.targetUserId) {
    formData.append('user_id', props.targetUserId)
  }
  try {
    const token = Cookies.get('XSRF-TOKEN')
    await axios.post('/api/assets/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-XSRF-TOKEN': decodeURIComponent(token),
      },
      withCredentials: true,
    })
    emit('update:modelValue', false)
    uploadFile.value = null
  } catch (e) {
    alert('Ошибка при импорте: ' + (e.response?.data?.message || e.message))
  }
}

function close() {
  emit('update:modelValue', false)
  uploadFile.value = null
}
</script>
