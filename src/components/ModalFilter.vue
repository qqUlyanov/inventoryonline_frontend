<template>
  <BaseModal :modelValue="modelValue" @update:modelValue="close" title="Фильтр">
    <form @submit.prevent="onFilterSubmit" class="grid grid-cols-2 gap-4">
      <input
        v-model="localFilters.type"
        type="text"
        placeholder="Тип"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.brand"
        type="text"
        placeholder="Бренд"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.status"
        type="text"
        placeholder="Статус"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.room"
        type="text"
        placeholder="Кабинет"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.user_id"
        type="text"
        placeholder="Ответственный (user_id)"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.inv_number"
        type="text"
        placeholder="Инв. №"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.name"
        type="text"
        placeholder="Модель"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.updated_at"
        type="text"
        placeholder="Обновлено (дата)"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <input
        v-model="localFilters.price"
        type="text"
        placeholder="Цена"
        class="px-3 py-2 border rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </form>
    <template #footer>
      <button type="button" @click="reset" class="text-gray-500 hover:text-gray-700 text-sm">
        Сбросить
      </button>
      <button
        type="button"
        @click="onFilterSubmit"
        class="bg-teal-600 text-white px-4 py-1.5 rounded hover:bg-teal-700 text-sm"
      >
        Применить
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { reactive, defineProps, defineEmits, watch } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: Boolean,
  filters: {
    type: Object,
    default: () => ({
      type: '',
      brand: '',
      status: '',
      room: '',
      user_id: '',
      inv_number: '',
      name: '',
      updated_at: '',
      price: '',
    }),
  },
})
const emit = defineEmits(['update:modelValue', 'update:filters', 'apply'])

const localFilters = reactive({ ...props.filters })

watch(
  () => props.filters,
  (val) => {
    Object.assign(localFilters, val)
  },
)

function onFilterSubmit() {
  emit('update:filters', { ...localFilters })
  emit('apply')
  emit('update:modelValue', false)
}
function reset() {
  Object.keys(localFilters).forEach((key) => (localFilters[key] = ''))
  emit('update:filters', { ...localFilters })
  emit('apply')
}
function close() {
  emit('update:modelValue', false)
}
</script>
