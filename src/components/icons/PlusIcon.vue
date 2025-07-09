<template>
  <svg
    class="PlusIcon"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
</template>

<script setup lang="ts">
type $Props = {
  size?: string | number
}

withDefaults(defineProps<$Props>(), {
  size: 24
})
</script>
