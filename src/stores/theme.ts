import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange'

export interface ThemeConfig {
  mode: ThemeMode
  colorScheme: ColorScheme
  fontSize: 'small' | 'medium' | 'large'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
  customColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
}

export const useThemeStore = defineStore('theme', () => {
  // State
  const mode = ref<ThemeMode>('auto')
  const colorScheme = ref<ColorScheme>('blue')
  const fontSize = ref<'small' | 'medium' | 'large'>('medium')
  const borderRadius = ref<'none' | 'small' | 'medium' | 'large'>('medium')
  const customColors = ref<Record<string, string>>({})

  // Getters
  const isDark = computed(() => {
    if (mode.value === 'dark') return true
    if (mode.value === 'light') return false
    // Auto mode - check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const isLight = computed(() => !isDark.value)

  const currentTheme = computed((): ThemeConfig => ({
    mode: mode.value,
    colorScheme: colorScheme.value,
    fontSize: fontSize.value,
    borderRadius: borderRadius.value,
    customColors: customColors.value
  }))

  const themeClass = computed(() => {
    const classes = []
    
    // Dark/Light mode
    classes.push(isDark.value ? 'dark' : 'light')
    
    // Color scheme
    classes.push(`theme-${colorScheme.value}`)
    
    // Font size
    classes.push(`font-${fontSize.value}`)
    
    // Border radius
    classes.push(`radius-${borderRadius.value}`)
    
    return classes.join(' ')
  })

  const cssVariables = computed(() => {
    const variables: Record<string, string> = {}
    
    // Color scheme variables
    const colorSchemes = {
      blue: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#06b6d4'
      },
      green: {
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399'
      },
      purple: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa'
      },
      orange: {
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#fbbf24'
      }
    }

    const colors = colorSchemes[colorScheme.value]
    Object.entries(colors).forEach(([key, value]) => {
      variables[`--color-${key}`] = customColors.value[key] || value
    })

    // Font size variables
    const fontSizes = {
      small: { base: '14px', heading: '20px' },
      medium: { base: '16px', heading: '24px' },
      large: { base: '18px', heading: '28px' }
    }

    const currentFontSize = fontSizes[fontSize.value]
    variables['--font-size-base'] = currentFontSize.base
    variables['--font-size-heading'] = currentFontSize.heading

    // Border radius variables
    const borderRadiuses = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '12px'
    }

    variables['--border-radius'] = borderRadiuses[borderRadius.value]

    return variables
  })

  // Actions
  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode
    applyTheme()
  }

  const setColorScheme = (scheme: ColorScheme) => {
    colorScheme.value = scheme
    applyTheme()
  }

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    fontSize.value = size
    applyTheme()
  }

  const setBorderRadius = (radius: 'none' | 'small' | 'medium' | 'large') => {
    borderRadius.value = radius
    applyTheme()
  }

  const setCustomColor = (colorKey: string, colorValue: string) => {
    customColors.value[colorKey] = colorValue
    applyTheme()
  }

  const removeCustomColor = (colorKey: string) => {
    delete customColors.value[colorKey]
    applyTheme()
  }

  const resetCustomColors = () => {
    customColors.value = {}
    applyTheme()
  }

  const toggleMode = () => {
    if (mode.value === 'light') {
      setMode('dark')
    } else if (mode.value === 'dark') {
      setMode('auto')
    } else {
      setMode('light')
    }
  }

  const applyTheme = () => {
    const root = document.documentElement
    
    // Apply theme class
    root.className = root.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-') && !cls.startsWith('font-') && !cls.startsWith('radius-') && cls !== 'dark' && cls !== 'light')
      .concat(themeClass.value.split(' '))
      .join(' ')

    // Apply CSS variables
    Object.entries(cssVariables.value).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark.value ? '#1f2937' : '#ffffff')
    }
  }

  const loadTheme = (config: Partial<ThemeConfig>) => {
    if (config.mode) mode.value = config.mode
    if (config.colorScheme) colorScheme.value = config.colorScheme
    if (config.fontSize) fontSize.value = config.fontSize
    if (config.borderRadius) borderRadius.value = config.borderRadius
    if (config.customColors) customColors.value = { ...config.customColors }
    
    applyTheme()
  }

  const reset = () => {
    mode.value = 'auto'
    colorScheme.value = 'blue'
    fontSize.value = 'medium'
    borderRadius.value = 'medium'
    customColors.value = {}
    applyTheme()
  }

  // Watch for system theme changes when in auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    if (mode.value === 'auto') {
      applyTheme()
    }
  }

  mediaQuery.addEventListener('change', handleSystemThemeChange)

  // Watch for mode changes to apply theme
  watch(
    [mode, colorScheme, fontSize, borderRadius, customColors],
    () => {
      applyTheme()
    },
    { deep: true }
  )

  return {
    // State
    mode,
    colorScheme,
    fontSize,
    borderRadius,
    customColors,
    
    // Getters
    isDark,
    isLight,
    currentTheme,
    themeClass,
    cssVariables,
    
    // Actions
    setMode,
    setColorScheme,
    setFontSize,
    setBorderRadius,
    setCustomColor,
    removeCustomColor,
    resetCustomColors,
    toggleMode,
    applyTheme,
    loadTheme,
    reset
  }
}, {
  persist: {
    key: 'theme-store',
    storage: localStorage,
    paths: ['mode', 'colorScheme', 'fontSize', 'borderRadius', 'customColors']
  }
})