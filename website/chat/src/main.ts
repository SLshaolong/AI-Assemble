/*
 * @Date: 2025-03-11 15:39:30
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 15:45:57
 * @FilePath: /chat/src/main.ts
 * @Description: from shaolong
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

