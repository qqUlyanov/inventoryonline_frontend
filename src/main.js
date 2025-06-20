import './assets/main.css'

import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)

app.config.globalProperties.$axios = axios
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'https://api.inventoryonline.ru'

axios.defaults.xsrfCookieName = 'XSRF-TOKEN'
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

// app.use(createPinia())

app.use(router).mount('#app')
