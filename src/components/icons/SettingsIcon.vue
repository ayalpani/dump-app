<template>
  <svg
    class="SettingsIcon"
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
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L19 8.5m-14 7L7.5 13m11 3.5L16.5 19m-9-9L5 7.5" />
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
