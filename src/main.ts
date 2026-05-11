import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/anketa.css'
import bridge from './plugins/vkBridge'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Проверка, что приложение запущено в VK (а не в обычном браузере)
if (window.top !== window.self) {
  // Приложение запущено внутри VK — инициализация
  bridge
    .send('VKWebAppInit', {})
    .then(() => {
      console.log('VK Mini App initialized successfully')
    })
    .catch((error: unknown) => {
      console.error('VK initialization failed:', error)
    })
} else {
  console.log('Running in standalone mode (not in VK)')
}

// Определяем, запускается ли приложение в VK Mini App
const isVKMiniApp = window.top !== window.self

// Функция для применения тёмной темы
export const applyDarkTheme = () => {
  document.documentElement.style.setProperty('--current-bg-color', 'var(--bg-color-dark)')
  document.documentElement.style.setProperty('--current-text-color', 'var(--text-color-dark)')
  document.documentElement.style.setProperty('--current-btn-bg', 'var(--btn-bg-dark)')
  document.documentElement.style.setProperty('--current-btn-border', 'var(--btn-border-dark)')
  document.documentElement.style.setProperty(
    '--current-btn-selected-bg',
    'var(--btn-selected-bg-dark)',
  )
  document.documentElement.style.setProperty('--current-error-bg', 'var(--error-bg-dark)')
  document.documentElement.style.setProperty('--current-error-text', 'var(--error-text-dark)')
  document.documentElement.style.setProperty('--current-input-bg', 'var(--input-bg-dark)')
  document.documentElement.style.setProperty('--current-input-border', 'var(--input-border-dark)')
}

// Функция для применения светлой темы (по умолчанию)
export const applyLightTheme = () => {
  document.documentElement.style.setProperty('--current-bg-color', 'var(--bg-color)')
  document.documentElement.style.setProperty('--current-text-color', 'var(--text-color)')
  document.documentElement.style.setProperty('--current-btn-bg', 'var(--btn-bg-light)')
  document.documentElement.style.setProperty('--current-btn-border', 'var(--btn-border-light)')
  document.documentElement.style.setProperty('--current-btn-selected-bg', 'var(--btn-selected-bg)')
  document.documentElement.style.setProperty('--current-error-bg', 'var(--error-bg-light)')
  document.documentElement.style.setProperty('--current-error-text', 'var(--error-text-light)')
  document.documentElement.style.setProperty('--current-input-bg', 'var(--input-bg-light)')
  document.documentElement.style.setProperty('--current-input-border', 'var(--input-border-light)')
}

// При запуске: если VK Mini App — принудительно светлая тема, иначе — по выбору пользователя
if (isVKMiniApp) {
  applyLightTheme() // Принудительно светлая тема в VK Mini App
} else {
  // Логика загрузки темы из localStorage или prefers-color-scheme
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme === 'dark') {
    applyDarkTheme()
  } else if (savedTheme === 'light') {
    applyLightTheme()
  } else {
    // Если тема не сохранена, используем prefers-color-scheme
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      applyDarkTheme()
    } else {
      applyLightTheme()
    }
  }
}

app.mount('#app')
