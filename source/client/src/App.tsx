import { Routes, Route } from 'react-router-dom'
import { Navigation } from './components/generic/navigation/Navigation'
import { Register } from './components/pages/register/Register'
import { Login } from './components/pages/login/Login'
import { Profile } from './components/pages/profile/Profile'
import { FC } from 'react'
import './App.css'

export const App: FC = () => {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}
