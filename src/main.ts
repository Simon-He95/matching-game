import { createApp } from 'vue'
import App from './App.vue'
import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'
import './main.css'
import { VividTyping } from 'vivid-typing'

const app = createApp(App)
app.component('VividTyping', VividTyping)
app.mount('#app')
