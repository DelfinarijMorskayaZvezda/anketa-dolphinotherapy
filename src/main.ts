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

app.mount('#app')
