<template>
  <div :class="cn('UiCard rounded-lg border bg-card text-card-foreground shadow-sm', className)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

type CardProps = {
  className?: string
}

defineProps<CardProps>()
</script>
