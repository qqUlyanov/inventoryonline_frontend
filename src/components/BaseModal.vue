<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div
          class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6 relative flex flex-col"
          @click.stop
          tabindex="0"
          ref="modalContent"
          v-bind="$attrs"
        >
          <button
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            @click="$emit('update:modelValue', false)"
            aria-label="Закрыть"
          >
            <i class="ri-close-line text-2xl"></i>
          </button>

          <div v-if="title" class="text-xl font-semibold mb-4">{{ title }}</div>
          <div class="flex-1">
            <slot />
          </div>
          <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: Boolean,
  title: String,
})
const emit = defineEmits(['update:modelValue'])

const modalContent = ref(null)

const emitClose = () => {
  emit('update:modelValue', false)
}

function onEsc(e) {
  if (e.key === 'Escape') emitClose()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      setTimeout(() => {
        modalContent.value?.focus()
      }, 0)
      window.addEventListener('keydown', onEsc)
    } else {
      window.removeEventListener('keydown', onEsc)
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('keydown', onEsc)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
