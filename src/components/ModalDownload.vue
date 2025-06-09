<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="close" title="Скачать технику">
    <div class="flex flex-col gap-4">
      <div>Скачать список техники в формате Excel или CSV.</div>
      <select v-model="localFormat" class="px-3 py-2 border rounded-md text-sm bg-gray-50">
        <option value="xlsx">Excel (.xlsx)</option>
        <option value="csv">CSV (.csv)</option>
      </select>
    </div>
    <template #footer>
      <button type="button" @click="close" class="text-gray-500 hover:text-gray-700 text-sm">
        Отмена
      </button>
      <button
        type="button"
        @click="handleDownload"
        class="bg-teal-600 text-white px-4 py-1.5 rounded hover:bg-teal-700 text-sm"
      >
        Скачать
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import axios from 'axios'
import Cookies from 'js-cookie'

const props = defineProps({
  modelValue: Boolean,
  format: {
    type: String,
    default: 'xlsx',
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue', 'update:format', 'download'])

const localFormat = ref(props.format)

watch(
  () => props.format,
  (val) => {
    localFormat.value = val
  },
)

async function handleDownload() {
  emit('update:format', localFormat.value)

  // Формируем параметры только с непустым name
  const params = {
    ...props.filters,
    format: localFormat.value,
    ...(props.search ? { name: props.search } : {}),
  }

  try {
    const token = Cookies.get('XSRF-TOKEN')
    const response = await axios.get('/api/assets/download', {
      params,
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'X-XSRF-TOKEN': decodeURIComponent(token || ''),
      },
      withCredentials: true,
    })

    const fileName = localFormat.value === 'csv' ? 'tmc.csv' : 'tmc.xlsx'
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    if (e.response?.data instanceof Blob) {
      const text = await e.response.data.text()
      try {
        const json = JSON.parse(text)
        alert(json?.error || 'Ошибка при скачивании файла')
      } catch {
        alert('Неизвестная ошибка при скачивании файла')
      }
    } else {
      alert('Ошибка при скачивании файла')
    }
  }

  emit('download')
  emit('update:modelValue', false)
}

function close() {
  emit('update:modelValue', false)
}
</script>
