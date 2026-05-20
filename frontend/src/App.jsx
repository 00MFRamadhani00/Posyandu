import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import PublicPage from './pages/PublicPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnakPage from './pages/AnakPage'
import AnakDetailPage from './pages/AnakDetailPage'
import PengukuranPage from './pages/PengukuranPage'
import KegiatanPage from './pages/KegiatanPage'
import UserPage from './pages/UserPage'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="anak" element={<AnakPage />} />
        <Route path="anak/:id" element={<AnakDetailPage />} />
        <Route path="pengukuran" element={<PengukuranPage />} />
        <Route path="kegiatan" element={<KegiatanPage />} />
        <Route path="pengguna" element={<UserPage />} />
      </Route>
    </Routes>
  )
}
