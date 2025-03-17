/*
 * @Date: 2025-03-10 14:03:44
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 08:36:33
 * @FilePath: /tokenManage/vite.config.ts
 * @Description: from shaolong
 */
import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [react()],
    server:{
      
        host: '0.0.0.0',
        port:5669,
        open: true,
        proxy: {
          "/api": {
            target: env.VITE_API_URL,
            changeOrigin: true,
            ws: true,
            rewrite: (path) => path.replace(/^\/api/, '')

          }
        }
      
    }
  }
 
})
