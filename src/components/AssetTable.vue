<template>
  <div class="overflow-hidden rounded-xl bg-white shadow-sm relative">
    <!-- Блок выделенной техники и операций -->
    <div
      v-if="selectable && Array.isArray(selected) && selected.length > 0"
      class="fixed right-8 bottom-8 z-50 bg-white border border-gray-300 shadow-lg px-6 py-4 rounded-xl flex flex-col gap-3 min-w-[320px] max-w-[420px]"
      style="transition: all 0.2s"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="font-semibold text-gray-800">
          Выделено: {{ Array.isArray(selected) ? selected.length : 0 }}
        </div>
        <div class="flex gap-2">
          <button
            class="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
            @click="showRequestModal = true"
            title="Заявка"
          >
            <i class="ri-mail-send-line"></i>
            <span>Заявка</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка оформления заявки -->
    <BaseModal v-model="showRequestModal" title="Оформить заявку">
      <div class="flex flex-col gap-4">
        <!-- Список выделенной техники -->
        <div>
          <div class="font-medium mb-1">Выделенные:</div>
          <div class="max-h-40 overflow-y-auto border rounded mb-2">
            <table class="min-w-full text-xs">
              <tbody>
                <tr v-for="item in selectedAssets" :key="item.id" class="border-b">
                  <td class="px-2 py-1">
                    <img
                      v-if="item.photo"
                      :src="item.photo"
                      alt=""
                      class="w-8 h-8 rounded object-cover"
                    />
                    <div
                      v-else
                      class="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400"
                    >
                      <i class="ri-image-line text-base"></i>
                    </div>
                  </td>
                  <td class="px-2 py-1">{{ item.inv_number }}</td>
                  <td class="px-2 py-1">{{ item.type }}</td>
                  <td class="px-2 py-1">{{ item.brand }}</td>
                  <td class="px-2 py-1">{{ item.name }}</td>
                  <td class="px-2 py-1">{{ item.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Операция -->
        <div class="font-medium mb-1">Операция:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="op in operations"
            :key="op.value"
            :class="[
              'px-3 py-1 rounded border',
              selectedOperation === op.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
            ]"
            @click="selectedOperation = op.value"
            type="button"
          >
            <i :class="op.icon" class="mr-1"></i>{{ op.label }}
          </button>
        </div>

        <!-- Список пользователей для передачи -->
        <div v-if="selectedOperation === 'transfer'">
          <div class="font-medium mt-2 mb-1">Кому передать:</div>
          <input
            v-model="userSearch"
            type="text"
            placeholder="Поиск пользователя"
            class="w-full px-3 py-2 border rounded mb-2"
          />
          <div class="max-h-40 overflow-y-auto flex flex-col gap-1">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectedUserId = user.id"
              :class="[
                'px-3 py-2 rounded cursor-pointer flex items-center gap-2',
                selectedUserId === user.id
                  ? 'bg-blue-100 text-blue-900 font-semibold'
                  : 'hover:bg-gray-100',
              ]"
            >
              <!-- Аватар пользователя -->
              <template v-if="user.avatar_path">
                <img
                  :src="user.avatar_path"
                  alt="avatar"
                  class="w-8 h-8 rounded-full object-cover border"
                />
              </template>
              <template v-else>
                <div
                  class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-base border"
                >
                  <i class="ri-user-3-line"></i>
                </div>
              </template>
              <span>{{ user.fullName || user.name || user.email }}</span>
              <span class="text-xs text-gray-400 ml-auto">Каб. {{ user.room }}</span>
            </div>
            <div
              v-if="Array.isArray(filteredUsers) && filteredUsers.length === 0"
              class="text-gray-400 text-sm px-2 py-2"
            >
              Нет пользователей
            </div>
          </div>
        </div>

        <!-- Комментарий -->
        <div>
          <div class="font-medium mb-1 mt-2">Комментарий:</div>
          <textarea
            v-model="requestComment"
            rows="2"
            class="w-full border rounded px-3 py-2"
            placeholder="Комментарий к заявке (необязательно)"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          @click="showRequestModal = false"
        >
          Отмена
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          :disabled="!selectedOperation || (selectedOperation === 'transfer' && !selectedUserId)"
          @click="submitRequest"
        >
          Отправить
        </button>
      </template>
    </BaseModal>

    <!-- Заголовки таблицы -->
    <div
      class="grid grid-cols-4 sm:grid-cols-10 text-sm font-medium text-gray-700 px-4 py-3 border-b items-center"
    >
      <div class="items-center justify-center h-10 hidden sm:flex">
        <input
          v-if="selectable"
          type="checkbox"
          class="scale-125"
          :checked="isAllChecked"
          @change="toggleSelectAll"
        />
      </div>
      <div class="flex justify-center">Фото</div>
      <div class="flex justify-center cursor-pointer select-none" @click="sortBy('inv_number')">
        Инв. №
        <SortIcon :active="sortKey === 'inv_number'" :order="sortOrder" />
      </div>
      <div class="flex justify-center cursor-pointer select-none" @click="sortBy('name')">
        Модель
        <SortIcon :active="sortKey === 'name'" :order="sortOrder" />
      </div>
      <div class="flex justify-center cursor-pointer select-none" @click="sortBy('status')">
        Статус
        <SortIcon :active="sortKey === 'status'" :order="sortOrder" />
      </div>
      <div class="justify-center cursor-pointer select-none hidden md:flex" @click="sortBy('type')">
        Тип
        <SortIcon :active="sortKey === 'type'" :order="sortOrder" />
      </div>
      <div
        class="justify-center cursor-pointer select-none hidden sm:flex"
        @click="sortBy('brand')"
      >
        Бренд
        <SortIcon :active="sortKey === 'brand'" :order="sortOrder" />
      </div>
      <div class="justify-center hidden sm:flex">Локация</div>
      <div
        class="justify-center cursor-pointer select-none hidden md:flex"
        @click="sortBy('updatedAt')"
      >
        Обновлено
        <SortIcon :active="sortKey === 'updatedAt'" :order="sortOrder" />
      </div>
      <div
        class="justify-center cursor-pointer select-none hidden md:flex"
        @click="sortBy('price')"
      >
        Цена
        <SortIcon :active="sortKey === 'price'" :order="sortOrder" />
      </div>
    </div>

    <!-- Данные -->
    <template v-if="!Array.isArray(displayItems) || displayItems.length === 0">
      <div class="text-center text-gray-400 py-6">Нет данных</div>
    </template>
    <template v-else>
      <div
        v-for="item in sortedItems"
        :key="item.id"
        class="grid grid-cols-4 sm:grid-cols-10 text-sm text-gray-700 px-4 py-3 border-b items-center transition-all duration-500 hover:bg-gray-100 cursor-pointer select-none"
        @click="rowClick(item.id)"
        @mousedown.right.prevent
        @touchstart.passive="handleTouchStart(item.id, $event)"
        @touchend.passive="handleTouchEnd(item.id, $event)"
      >
        <div class="items-center justify-center h-10 hidden sm:flex">
          <input
            v-if="selectable"
            type="checkbox"
            class="scale-125"
            :checked="Array.isArray(selected) && selected.includes(item.id)"
            @change.stop="handleRowCheckboxChange(item.id, $event.target.checked)"
            @click.stop
          />
        </div>
        <div class="flex justify-center">
          <template v-if="item.photo">
            <img :src="item.photo" alt="" class="w-10 h-10 rounded object-cover" />
          </template>
          <template v-else>
            <div
              class="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400"
            >
              <i class="ri-image-line text-xl"></i>
            </div>
          </template>
        </div>
        <div class="flex justify-center">
          <span class="truncate-cell" :title="item.inv_number">
            {{ item.inv_number }}
          </span>
        </div>
        <div class="flex justify-center">
          <span class="truncate-cell" :title="item.name">
            {{ item.name }}
          </span>
        </div>
        <div class="flex justify-center">
          <span class="truncate-cell" :title="item.status">
            {{ item.status }}
          </span>
        </div>
        <div class="justify-center hidden md:flex">
          <span class="truncate-cell" :title="item.type">
            {{ item.type }}
          </span>
        </div>
        <div class="justify-center hidden sm:flex">
          <span class="truncate-cell" :title="item.brand">
            {{ item.brand }}
          </span>
        </div>
        <div class="justify-center hidden sm:flex">
          <span class="truncate-cell" :title="item.room">
            {{ item.room }}
          </span>
        </div>
        <div class="justify-center hidden md:flex">
          <span class="truncate-cell" :title="formatDate(item.updatedAt || item.updated_at)">
            {{ formatDate(item.updatedAt || item.updated_at) }}
          </span>
        </div>
        <div class="justify-center hidden md:flex">
          <span class="truncate-cell" :title="item.price">
            {{ item.price ? item.price + ' ₽' : '—' }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, watch, h } from 'vue'
import BaseModal from './BaseModal.vue'
import axios from 'axios'
import Cookies from 'js-cookie'
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Array,
    default: undefined,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: String,
    default: '',
  },
  usersList: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits([
  'rowClick',
  'update:modelValue',
  'selectedItemsClick',
  'reportSelected',
  'requestSubmit',
])

const selected = ref(Array.isArray(props.modelValue) ? [...props.modelValue] : [])

watch(
  () => props.modelValue,
  (val) => {
    if (Array.isArray(val)) selected.value = [...val]
    else selected.value = []
  },
)

const isAllChecked = computed(() => {
  return (
    Array.isArray(displayItems.value) &&
    Array.isArray(selected.value) &&
    displayItems.value.length > 0 &&
    selected.value.length === displayItems.value.length
  )
})

function toggleSelectAll() {
  if (isAllChecked.value) {
    selected.value = []
  } else {
    selected.value = Array.isArray(displayItems.value)
      ? displayItems.value.map((item) => item.id)
      : []
  }
  emit('update:modelValue', [...selected.value])
}

function rowClick(id) {
  emit('rowClick', id)
}

function formatDate(val) {
  if (!val) return ''
  const date = new Date(val)
  if (isNaN(date)) return val
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// --- фильтрация и поиск внутри таблицы ---
const displayItems = computed(() => {
  let result = Array.isArray(props.items) ? props.items : []

  if (props.search && props.search.trim()) {
    const query = props.search.toLowerCase()
    result = result.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.inv_number && item.inv_number.toLowerCase().includes(query)) ||
        (item.type && item.type.toLowerCase().includes(query)) ||
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.status && item.status.toLowerCase().includes(query)) ||
        (item.room && item.room.toLowerCase().includes(query)),
    )
  }

  if (props.filters && Object.keys(props.filters).length > 0) {
    Object.entries(props.filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) =>
          String(item[key] ?? '')
            .toLowerCase()
            .includes(String(value).toLowerCase()),
        )
      }
    })
  }

  return result
})
// --- конец фильтрации ---

// Сортировка
const sortKey = ref('')
const sortOrder = ref('asc')

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const sortedItems = computed(() => {
  let arr = [...displayItems.value]
  if (!sortKey.value) return arr
  return arr.sort((a, b) => {
    let aVal = a[sortKey.value]
    let bVal = b[sortKey.value]
    // Для даты обновления
    if (sortKey.value === 'updatedAt' || sortKey.value === 'updated_at') {
      aVal = new Date(a.updatedAt || a.updated_at)
      bVal = new Date(b.updatedAt || b.updated_at)
    }
    // Для цены
    if (sortKey.value === 'price') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
    }
    if (aVal == null) aVal = ''
    if (bVal == null) bVal = ''
    if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

// Иконка сортировки без JSX
const SortIcon = (props) => {
  if (props.active) {
    return props.order === 'asc'
      ? h('i', { class: 'ri-arrow-up-s-line ml-1 text-xs' })
      : h('i', { class: 'ri-arrow-down-s-line ml-1 text-xs' })
  }
  return h('i', { class: 'ri-arrow-up-down-line ml-1 text-xs opacity-30' })
}

function emitSelected() {
  emit('selectedItemsClick', selected.value)
}

const showRequestModal = ref(false)
const selectedOperation = ref('')
const requestComment = ref('')
const userSearch = ref('')
const selectedUserId = ref(null)

const operations = [
  { value: 'repair', label: 'Ремонт', icon: 'ri-tools-line' },
  { value: 'change', label: 'Сменить', icon: 'ri-exchange-line' },
  { value: 'transfer', label: 'Передать', icon: 'ri-share-forward-line' },
  { value: 'error', label: 'Сообщить об ошибке', icon: 'ri-bug-line' },
]

const filteredUsers = computed(() => {
  if (!props.usersList || !Array.isArray(props.usersList)) return []
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return props.usersList
  return props.usersList.filter(
    (u) =>
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)),
  )
})

async function submitRequest() {
  try {
    // Гарантируем, что selected.value всегда массив
    let assetIds = []
    if (Array.isArray(selected.value)) {
      assetIds = selected.value
    } else if (Array.isArray(props.modelValue)) {
      assetIds = props.modelValue
    } else {
      assetIds = []
    }

    // Приводим к массиву только чисел/строк и фильтруем null/undefined
    assetIds = assetIds.filter(
      (v) => (typeof v === 'number' || typeof v === 'string') && v !== undefined && v !== null,
    )

    // Проверка только на массив и длину
    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      alert('Выберите хотя бы одну технику или оборудование для заявки')
      return
    }

    // --- сначала оформляем заявку, потом меняем статус только после одобрения админом ---
    await axios.get('http://api.inventoryonline.ru/sanctum/csrf-cookie', { withCredentials: true })
    const token = Cookies.get('XSRF-TOKEN')

    const payload = {
      asset_ids: assetIds,
      operation: selectedOperation.value,
      user_id: selectedOperation.value === 'transfer' ? selectedUserId.value : null,
      comment: requestComment.value,
      user_transfer_id: selectedOperation.value === 'transfer' ? selectedUserId.value : null,
    }
    await axios.post('/api/asset-requests', payload, {
      withCredentials: true,
      headers: {
        'X-XSRF-TOKEN': decodeURIComponent(token),
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
      },
    })
    // После успешного создания заявки обновляем статусы техники локально
    assetIds.forEach((assetId) => {
      const item = props.items.find((i) => i.id === assetId)
      if (item) item.status = 'Об. статуса'
    })

    showRequestModal.value = false
    selectedOperation.value = ''
    selectedUserId.value = null
    requestComment.value = ''
    userSearch.value = ''
    emit('requestSubmit', payload)

    // --- обновить уведомления и статистику заявок, если глобальные функции доступны ---
    if (window && typeof window.fetchNotifications === 'function') {
      setTimeout(() => window.fetchNotifications(), 500)
    }
    if (window && typeof window.fetchAnalyticsStats === 'function') {
      setTimeout(() => window.fetchAnalyticsStats(), 500)
    }
    // --- конец добавленного ---
  } catch (e) {
    if (e.response && e.response.status === 409) {
      alert(e.response.data?.message || 'На выбранную технику уже есть активная заявка!')
    } else {
      let msg = ''
      try {
        if (e && e.response && e.response.data) {
          if (typeof e.response.data === 'string') {
            msg = e.response.data
          } else if (typeof e.response.data === 'object') {
            msg = e.response.data.message || JSON.stringify(e.response.data)
          }
        } else if (e && e.message) {
          msg = e.message
        } else {
          msg = String(e)
        }
      } catch (err) {
        msg = 'Неизвестная ошибка'
      }
      alert('Ошибка при отправке заявки: ' + msg)
    }
  }
}

const selectedAssets = computed(() =>
  Array.isArray(props.items) && Array.isArray(selected.value)
    ? props.items.filter(
        (item) => Array.isArray(selected.value) && selected.value.includes(item.id),
      )
    : [],
)

function handleRowCheckboxChange(id, checked) {
  if (checked) {
    if (Array.isArray(selected.value) && !selected.value.includes(id)) selected.value.push(id)
  } else {
    if (Array.isArray(selected.value)) selected.value = selected.value.filter((v) => v !== id)
  }
  emit('update:modelValue', Array.isArray(selected.value) ? [...selected.value] : [])
}

// --- touch выделение на мобильных ---
let touchTimeout = null
function handleTouchStart(id, event) {
  if (window.innerWidth >= 640) return // только для мобильных
  touchTimeout = setTimeout(() => {
    if (Array.isArray(selected.value)) {
      if (!selected.value.includes(id)) {
        selected.value.push(id)
        emit('update:modelValue', [...selected.value])
      }
    }
  }, 500) // 500мс — имитация long tap
}
function handleTouchEnd(id, event) {
  if (window.innerWidth >= 640) return
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }
}
</script>

<style scoped>
.truncate-cell {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: bottom;
}
</style>
