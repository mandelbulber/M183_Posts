import { Routes, Route } from 'react-router-dom'
import { Navigation } from './components/generic/navigation/Navigation'
import { TwoFactor } from './components/pages/twofactor/TwoFactor'
import { Register } from './components/pages/register/Register'
import { Profile } from './components/pages/profile/Profile'
import { Login } from './components/pages/login/Login'
import { FC } from 'react'
import './App.css'

export const App: FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<TwoFactor />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}
