/*
 * @Date: 2025-03-11 15:39:30
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 16:14:40
 * @FilePath: /chat/vite.config.ts
 * @Description: from shaolong
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5900', // 这里修改为你的实际后端接口地址
        // target: 'http://cmanage.51ds8.cn/api', // 这里修改为你的实际后端接口地址

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
