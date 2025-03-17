/*
 * @Date: 2025-03-10 14:03:44
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 10:47:39
 * @FilePath: /tokenManage/src/App.tsx
 * @Description: from shaolong
 */
/*
 * @Date: 2025-03-10 14:03:44
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-10 16:18:18
 * @FilePath: /tokenManage/src/App.tsx
 * @Description: from shaolong
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Layout/Login'
import Home from './Layout/Home'
import HomeIndex from './Layout/HomeIndex'
import Token from './Layout/Token'
import Account from './Layout/Account'
function App() {
  const checkLoginStatus = () => {
    const loginFlag = localStorage.getItem('loginFlag')
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return loginFlag === 'true' && 
           userInfo && 
           userInfo.username && 
           userInfo.userId && 
           userInfo.userpermission
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            checkLoginStatus() ? 
            <Navigate to="/home/index" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/home" 
          element={
            checkLoginStatus() ? 
            <Home /> : 
            <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/home/index" replace />} />
          <Route path="index" element={<HomeIndex />}  />
          <Route path="token" element={<Token />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
