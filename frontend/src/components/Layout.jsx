import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][now.getDay()]
  const tanggal = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const waktu = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="px-4 py-3 border-b border-green-700 text-center">
      <p className="text-green-200 text-xs">{hari}, {tanggal}</p>
      <p className="text-white text-lg font-mono font-semibold tracking-widest">{waktu}</p>
    </div>
  )
}

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/pengukuran', label: 'Pengukuran', icon: '⚖️' },
  { to: '/admin/anak', label: 'Data Anak', icon: '👶' },
  { to: '/admin/kegiatan', label: 'Kegiatan', icon: '📋' },
  { to: '/admin/pengguna', label: 'Pengguna', icon: '👤', adminOnly: true },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'ADMIN')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 border-b border-green-700">
          <h1 className="text-xl font-bold">🏥 Posyandu</h1>
          <p className="text-green-300 text-sm mt-1">Sistem Informasi</p>
        </div>
        <Clock />
        <nav className="flex-1 p-4 space-y-1">
          {visibleNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-green-600 text-white' : 'text-green-200 hover:bg-green-700'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-green-700">
          <p className="text-green-300 text-sm">{user?.nama}</p>
          <p className="text-green-400 text-xs">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-sm text-red-300 hover:text-red-100"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
