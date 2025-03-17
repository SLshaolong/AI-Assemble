/*
 * @Date: 2025-03-10 14:03:44
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 10:10:23
 * @FilePath: /tokenManage/src/Layout/Login.tsx
 * @Description: from shaolong
 */
import { useEffect, useState } from 'react'
import '../css/login.css'
import {Login as LoginForm} from "../api/login"
import { useMessage } from "../utils/useMessage"
function Login() {
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'sl3037302304'
  })
  useEffect(()=>{
    localStorage.clear()
  },[])
  const {error,success} = useMessage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(formData.username && formData.password){
      const result:any= await LoginForm(formData)
      if(result){
        localStorage.setItem("loginFlag",'true')
        localStorage.setItem("userInfo",JSON.stringify(result.data))
        success("登录成功～")
        window.location.href = '/home'
      }
      
    }else{
      error("the username and the password is required!")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>后台管理系统</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>用户名</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
            />
          </div>
          <div className="input-group">
            <label>密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
            />
          </div>
          <button type="submit" className="login-button">
            登录
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
