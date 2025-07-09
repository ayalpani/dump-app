# Vue Component File Structure Rules

## One Component Per File

Each Vue component must be defined in its own dedicated file with a matching filename:

```vue
<!-- ✅ GOOD: Component name matches filename -->
<!-- src/components/map/DemoMap.vue -->
<template>
  <div class="DemoMap">
    <!-- Component template -->
  </div>
</template>

<script setup lang="ts">
// Component implementation
</script>
```

## Naming Conventions

- **Files**: Use PascalCase for component files (e.g., `DemoMap.vue`)
- **Directories**: Use camelCase for directories (e.g., `components/map/`)
- **Components**: Use PascalCase for component names, matching the filename
- **Props**: Use camelCase for prop names
- **Events**: Use kebab-case for custom events

## Component Root Class

- The component name must be added as a class to the root element of the component
- This helps with debugging and styling specificity
- Use the component name as the primary class, followed by utility classes

```vue
<!-- ✅ GOOD: Component name as root class -->
<template>
  <div class="DemoDetails w-full p-4 bg-white rounded-lg">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>
```

## Script Setup Convention

- Always use `<script setup lang="ts">` for new components
- This provides better TypeScript support and cleaner syntax
- Define types using `type` instead of `interface`

## State Management

- Local state should be used for component-specific concerns only (using `ref()` or `reactive()`)
- When a state variable needs to be accessed by multiple components, it must be moved to the appropriate Pinia store
- Never prop-drill state or callbacks through component hierarchies
- Use composables for reusable logic

## Component Size Limits

- New components should stay well below 100 lines of code (including template, script, and style)
- If a component is approaching or exceeds 100 lines, break it down into smaller, focused components
- Extract reusable logic into composables when appropriate
- Consider splitting large templates into smaller sub-components

## Template Organization

- Keep templates clean and readable
- Use early returns in computed properties and methods
- Prefer composition over complex template logic
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)

## Event Handling

- Event handlers should be named with a "handle" prefix (e.g., `handleClick`, `handleSubmit`)
- Use `const` for event handlers
- Define proper TypeScript types for event parameters

## Examples

### Good: Single responsibility component with proper structure

```vue
<!-- src/components/map/ZoomControl.vue -->
<template>
  <div class="ZoomControl flex flex-col gap-2">
    <button 
      @click="handleZoomIn"
      @keydown="handleKeyDown"
      class="bg-white p-2 rounded shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Zoom in"
      tabindex="0"
    >
      +
    </button>
    <button 
      @click="handleZoomOut"
      @keydown="handleKeyDown"
      class="bg-white p-2 rounded shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Zoom out"
      tabindex="0"
    >
      -
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDemoStore } from '@/stores/demoStore'

type $MapRef = {
  zoomIn: () => void
  zoomOut: () => void
  getZoom: () => number
}

type $Props = {
  mapRef: Ref<$MapRef | null>
}

const props = defineProps<$Props>()

// Direct store access instead of prop drilling
const demoStore = useDemoStore()

const handleZoomIn = (): void => {
  if (!props.mapRef.value) return
  
  props.mapRef.value.zoomIn()
  demoStore.setZoomLevel(props.mapRef.value.getZoom())
}

const handleZoomOut = (): void => {
  if (!props.mapRef.value) return
  
  props.mapRef.value.zoomOut()
  demoStore.setZoomLevel(props.mapRef.value.getZoom())
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const target = event.target as HTMLButtonElement
    target.click()
  }
}
</script>
```

### Good: Component with composable for reusable logic

```vue
<!-- src/components/ui/LoadingSpinner.vue -->
<template>
  <div class="LoadingSpinner flex items-center justify-center">
    <div 
      :class="spinnerClasses"
      class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      :aria-label="loadingText"
    />
    <span v-if="showText" class="ml-2 text-sm text-gray-600">
      {{ loadingText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type $Props = {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  loadingText?: string
}

const props = withDefaults(defineProps<$Props>(), {
  size: 'md',
  showText: false,
  loadingText: 'Loading...'
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return sizeClasses[props.size]
})
</script>
```

### Bad: Component not matching filename or missing root class

```vue
<!-- ❌ BAD: src/components/map/ZoomControls.vue -->
<template>
  <!-- Missing component name as class -->
  <button @click="handleClick" class="bg-white p-2 rounded shadow">
    +
  </button>
</template>

<script setup lang="ts">
// ❌ Component name doesn't match filename
// ❌ Missing TypeScript types
// ❌ Poor event handler naming
const handleClick = () => {
  mapRef.value?.zoomIn()
}
</script>
```

### Bad: Component exceeding size limit

```vue
<!-- ❌ BAD: Component is too large (over 100 lines) -->
<template>
  <div class="MegaComponent">
    <!-- 150+ lines of template with multiple responsibilities -->
    <!-- Should be broken down into smaller components -->
  </div>
</template>

<script setup lang="ts">
// 100+ lines of script with multiple responsibilities
// Should be broken down into smaller components and composables
</script>

<style scoped>
/* 50+ lines of component-specific styles */
/* Consider if this should be in Tailwind classes instead */
</style>
```

## Composables for Reusable Logic

Extract reusable logic into composables following the `use` prefix convention:

```ts
// src/composables/useMapControls.ts
import { ref, type Ref } from 'vue'
import { useDemoStore } from '@/stores/demoStore'

type $MapRef = {
  zoomIn: () => void
  zoomOut: () => void
  getZoom: () => number
}

export const useMapControls = (mapRef: Ref<$MapRef | null>) => {
  const demoStore = useDemoStore()
  const isZooming = ref(false)

  const handleZoomIn = async (): Promise<void> => {
    if (!mapRef.value || isZooming.value) return
    
    isZooming.value = true
    mapRef.value.zoomIn()
    demoStore.setZoomLevel(mapRef.value.getZoom())
    isZooming.value = false
  }

  const handleZoomOut = async (): Promise<void> => {
    if (!mapRef.value || isZooming.value) return
    
    isZooming.value = true
    mapRef.value.zoomOut()
    demoStore.setZoomLevel(mapRef.value.getZoom())
    isZooming.value = false
  }

  return {
    isZooming: readonly(isZooming),
    handleZoomIn,
    handleZoomOut
  }
}
```

## Style Guidelines

- Prefer Tailwind utility classes over scoped styles
- Use scoped styles only when Tailwind utilities are insufficient
- Keep scoped styles minimal and component-specific
- Use CSS custom properties for dynamic values when needed

## Accessibility Requirements

- All interactive elements must have proper ARIA labels
- Implement keyboard navigation with `tabindex` and `@keydown` handlers
- Use semantic HTML elements when possible
- Ensure proper color contrast and focus indicators

## Benefits

- **Improved maintainability**: Each file has a clear, single responsibility
- **Better code organization**: Easy to locate components by name
- **Reduced complexity**: Smaller components are easier to understand and test
- **Simplified state management**: State lives where it belongs - either locally or in Pinia stores
- **Easier collaboration**: Team members can work on different components without conflicts
- **Enhanced debugging**: Component name in class makes it easier to identify elements in DevTools
- **Better TypeScript support**: Proper typing improves development experience and catches errors early
- **Improved accessibility**: Consistent accessibility patterns across all components
