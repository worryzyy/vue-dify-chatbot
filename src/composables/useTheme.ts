import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { ThemeMode, ColorScheme, ThemeConfig } from '@/stores/theme'

export function useTheme() {
  const themeStore = useThemeStore()

  // Computed properties from store
  const mode = computed(() => themeStore.mode)
  const colorScheme = computed(() => themeStore.colorScheme)
  const fontSize = computed(() => themeStore.fontSize)
  const borderRadius = computed(() => themeStore.borderRadius)
  const customColors = computed(() => themeStore.customColors)
  const isDark = computed(() => themeStore.isDark)
  const isLight = computed(() => themeStore.isLight)
  const currentTheme = computed(() => themeStore.currentTheme)
  const themeClass = computed(() => themeStore.themeClass)
  const cssVariables = computed(() => themeStore.cssVariables)

  // Theme actions
  const setMode = (newMode: ThemeMode) => {
    themeStore.setMode(newMode)
  }

  const setColorScheme = (scheme: ColorScheme) => {
    themeStore.setColorScheme(scheme)
  }

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    themeStore.setFontSize(size)
  }

  const setBorderRadius = (radius: 'none' | 'small' | 'medium' | 'large') => {
    themeStore.setBorderRadius(radius)
  }

  const setCustomColor = (colorKey: string, colorValue: string) => {
    themeStore.setCustomColor(colorKey, colorValue)
  }

  const removeCustomColor = (colorKey: string) => {
    themeStore.removeCustomColor(colorKey)
  }

  const resetCustomColors = () => {
    themeStore.resetCustomColors()
  }

  const toggleMode = () => {
    themeStore.toggleMode()
  }

  const applyTheme = () => {
    themeStore.applyTheme()
  }

  const loadTheme = (config: Partial<ThemeConfig>) => {
    themeStore.loadTheme(config)
  }

  const resetTheme = () => {
    themeStore.reset()
  }

  // Theme utilities
  const getThemeColor = (colorKey: string): string => {
    const variables = cssVariables.value
    return variables[`--color-${colorKey}`] || ''
  }

  const generateThemeCSS = (): string => {
    const variables = cssVariables.value
    const cssRules = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')
    
    return `:root {\n${cssRules}\n}`
  }

  // Predefined themes
  const presetThemes: Record<string, Partial<ThemeConfig>> = {
    default: {
      mode: 'auto',
      colorScheme: 'blue',
      fontSize: 'medium',
      borderRadius: 'medium'
    },
    darkBlue: {
      mode: 'dark',
      colorScheme: 'blue',
      fontSize: 'medium',
      borderRadius: 'medium'
    },
    lightGreen: {
      mode: 'light',
      colorScheme: 'green',
      fontSize: 'medium',
      borderRadius: 'small'
    },
    darkPurple: {
      mode: 'dark',
      colorScheme: 'purple',
      fontSize: 'large',
      borderRadius: 'large'
    },
    lightOrange: {
      mode: 'light',
      colorScheme: 'orange',
      fontSize: 'small',
      borderRadius: 'none'
    }
  }

  const applyPresetTheme = (presetName: string) => {
    const preset = presetThemes[presetName]
    if (preset) {
      loadTheme(preset)
    }
  }

  const getPresetThemes = () => Object.keys(presetThemes)

  // Color scheme options
  const colorSchemeOptions: Array<{ label: string; value: ColorScheme; color: string }> = [
    { label: 'Blue', value: 'blue', color: '#3b82f6' },
    { label: 'Green', value: 'green', color: '#10b981' },
    { label: 'Purple', value: 'purple', color: '#8b5cf6' },
    { label: 'Orange', value: 'orange', color: '#f59e0b' }
  ]

  // Font size options
  const fontSizeOptions: Array<{ label: string; value: 'small' | 'medium' | 'large' }> = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ]

  // Border radius options
  const borderRadiusOptions: Array<{ label: string; value: 'none' | 'small' | 'medium' | 'large' }> = [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ]

  // Theme mode options
  const themeModeOptions: Array<{ label: string; value: ThemeMode; icon: string }> = [
    { label: 'Light', value: 'light', icon: '☀️' },
    { label: 'Dark', value: 'dark', icon: '🌙' },
    { label: 'Auto', value: 'auto', icon: '🔄' }
  ]

  // Media query helpers
  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 768
  })

  const isTablet = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 768 && window.innerWidth < 1024
  })

  const isDesktop = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 1024
  })

  // System preference detection
  const getSystemThemePreference = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const watchSystemThemeChange = (callback: (isDark: boolean) => void) => {
    if (typeof window === 'undefined') return () => {}

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => callback(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }

  return {
    // State
    mode,
    colorScheme,
    fontSize,
    borderRadius,
    customColors,
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
    resetTheme,
    
    // Utilities
    getThemeColor,
    generateThemeCSS,
    applyPresetTheme,
    getPresetThemes,
    
    // Options
    colorSchemeOptions,
    fontSizeOptions,
    borderRadiusOptions,
    themeModeOptions,
    presetThemes,
    
    // Media queries
    isMobile,
    isTablet,
    isDesktop,
    
    // System preferences
    getSystemThemePreference,
    watchSystemThemeChange
  }
}