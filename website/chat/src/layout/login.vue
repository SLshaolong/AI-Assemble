<template>
  <div class="login-container">
    <div class="login-box">
      <h2>系统登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            type="text"
            v-model="loginForm.username"
            placeholder="用户名"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            v-model="loginForm.password"
            placeholder="密码"
            required
          />
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loginForm = reactive({
  username: '',
  password: ''
})

interface LoginResponse {
  code: number
  data: {
    token: string
  }
  message: string
}

const handleLogin = async () => {
  try {
    const res = await request.post<LoginResponse>('/userLogin', loginForm)
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userinfo', JSON.stringify(res.data))
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background-color: #1a1a1a;
}

.login-box {
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background-color: #333333;
  color: #ffffff;
  outline: none;
}

input:focus {
  border-color: #4a90e2;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #357abd;
}
</style> 