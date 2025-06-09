<template>
  <div
    class="grid grid-cols-[40px_1fr_auto_auto_auto] items-center px-4 py-3 border-b text-gray-500 gap-3"
  >
    <button class="flex justify-center" @click="$emit('showFilter')" title="Фильтр">
      <i class="ri-filter-3-line text-2xl hover:text-teal-600 transition-colors"></i>
    </button>

    <slot name="filter-modal"></slot>

    <div class="relative col-span-1">
      <input
        type="text"
        placeholder="Поиск"
        v-model="search"
        class="pl-8 pr-3 py-1.5 rounded-md text-sm w-full bg-gray-100 focus:outline-none"
        @input="onSearchInput"
      />
      <i class="ri-search-line absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
    </div>

    <button
      v-if="isAdmin"
      class="flex items-center gap-1 justify-center text-teal-600 hover:text-teal-800 transition-colors"
      title="Создать технику"
      @click="$emit('showCreate')"
    >
      <i class="ri-add-line text-2xl"></i>
    </button>

    <slot v-if="isAdmin" name="create-modal"></slot>

    <button
      v-if="isAdmin"
      class="flex items-center gap-1 justify-center text-teal-600 hover:text-teal-800 transition-colors"
      title="Загрузить"
      @click="$emit('showUpload')"
    >
      <i class="ri-upload-cloud-2-line text-2xl"></i>
    </button>

    <slot v-if="isAdmin" name="upload-modal"></slot>

    <button
      v-if="isAdmin"
      class="flex items-center gap-1 justify-center text-teal-600 hover:text-teal-800 transition-colors"
      title="Скачать"
      @click="$emit('showDownload')"
    >
      <i class="ri-download-cloud-2-line text-2xl"></i>
    </button>

    <slot v-if="isAdmin" name="download-modal"></slot>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
const props = defineProps({
  searchValue: {
    type: String,
    default: '',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits([
  'update:search',
  'showFilter',
  'showCreate',
  'showUpload',
  'showDownload',
  'apply', // добавлено для фильтра
  'update:filters', // добавлено для фильтра
])

const search = ref(props.searchValue)
watch(
  () => props.searchValue,
  (val) => {
    search.value = val
  },
)

function onSearchInput() {
  emit('update:search', search.value)
}

// Для поддержки фильтрации через модалку
// (слушайте события update:filters и apply в родителе)
</script>

<style scoped></style>
