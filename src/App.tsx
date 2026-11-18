import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Gallery from './pages/Gallery'
import Auth from './pages/Auth'
import DashboardLayout from './layouts/DashboardLayout'
import Home from './pages/dashboard/Home'
import Seniors from './pages/dashboard/Seniors'
import Programs from './pages/dashboard/Programs'
import Biometrics from './pages/dashboard/Biometrics'
import Account from './pages/dashboard/Account'
import Policy from './pages/Policy'
import Tablet from './pages/Tablet'
import TV from './pages/TV'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/screens" element={<Gallery />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="signup" />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="seniors" element={<Seniors />} />
          <Route path="programs" element={<Programs />} />
          <Route path="biometrics" element={<Biometrics />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="/tablet" element={<Tablet />} />
        <Route path="/tv" element={<TV />} />
        <Route path="/privacy" element={<Policy kind="privacy" />} />
        <Route path="/terms" element={<Policy kind="terms" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
