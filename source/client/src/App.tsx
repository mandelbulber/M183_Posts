import { Routes, Route } from 'react-router-dom'
import { Navigation } from './components/generic/navigation/Navigation'
import { TwoFactor } from './components/pages/twofactor/TwoFactor'
import { Dashboard } from './components/pages/dashboard/Dashboard'
import { Register } from './components/pages/register/Register'
import { Profile } from './components/pages/profile/Profile'
import { Login } from './components/pages/login/Login'
import { Post } from './components/pages/post/Post'
import { Home } from './components/pages/home/Home'
import { Totp } from './components/pages/totp/Totp'
import { FC } from 'react'
import './App.css'

export const App: FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<TwoFactor />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setupTotp" element={<Totp />} />
      </Routes>
    </>
  )
}
