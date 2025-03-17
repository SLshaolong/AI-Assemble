/*
 * @Date: 2025-03-10 16:26:35
 * @LastEditors: shaolong sl3037302304@gmail.com
 * @LastEditTime: 2025-03-11 10:44:16
 * @FilePath: /tokenManage/src/Layout/Home.tsx
 * @Description: from shaolong
 */
import { useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import { HomeOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import "../css/home.css"
const { Header, Sider, Content } = Layout

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [userInfo] = useState(() => {
    return JSON.parse(localStorage.getItem('userInfo') || '{}')
  })

  const menuItems = [
    {
      key: '/home/index',
      icon: <HomeOutlined />,
      label: 'Home'
    },
    {
      key: '/home/token',
      icon: <KeyOutlined />,
      label: 'Token'
    },
    {
      key: '/home/account',
      icon: <UserOutlined />,
      label: 'Account'
    }
  ]

  const handleMenuClick = (key: string) => {
    navigate(key)
  }

  const handleLogout = () => {
    localStorage.removeItem('loginFlag')
    localStorage.removeItem('userInfo')
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        background: '#fff'
      }}>
        <div className="logo">后台管理系统</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>用户名: {userInfo.username}</span>
          <span>权限: {userInfo.userpermission}</span>
          <Button type="primary" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </Header>

      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({key}) => handleMenuClick(key)}
          />
        </Sider>
        
        <Content style={{ 
          padding: 24,
          minHeight: 280,
          background: '#fff',
          margin: '24px',
          overflow:'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default Home
