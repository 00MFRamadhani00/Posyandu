import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'

export default function UserPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', nama: '', role: 'KADER' })

  if (user?.role !== 'ADMIN') {
    return <div className="p-6 text-gray-500">Hanya Admin yang dapat mengakses halaman ini.</div>
  }

  const load = () => api.get('/auth/users').then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  const openEdit = (u) => {
    setEditTarget(u)
    setForm({ nama: u.nama, username: u.username, password: '', role: u.role })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditTarget(null)
    setForm({ username: '', password: '', nama: '', role: 'KADER' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editTarget) {
        await api.put(`/auth/users/${editTarget.id}`, form)
      } else {
        await api.post('/auth/users', form)
      }
      closeForm()
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengguna')
    }
  }

  const handleToggle = async (id, aktif) => {
    await api.patch(`/auth/users/${id}/toggle`, { aktif: !aktif })
    load()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <button onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium">
          + Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-green-50 text-green-800">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.nama}</td>
                <td className="px-4 py-3 text-gray-500 font-mono">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                    {u.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <button onClick={() => openEdit(u)}
                    className="text-xs text-blue-500 hover:text-blue-700 underline">
                    Edit
                  </button>
                  {u.id !== user.id && (
                    <button onClick={() => handleToggle(u.id, u.aktif)}
                      className="text-xs text-gray-500 hover:text-gray-800 underline">
                      {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4">{editTarget ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
                  <input required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Username *</label>
                  <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password {editTarget && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                    {!editTarget && '*'}
                  </label>
                  <input
                    required={!editTarget}
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                    placeholder={editTarget ? '••••••••' : ''}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                    <option value="KADER">Kader</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-800">
                    Simpan
                  </button>
                  <button type="button" onClick={closeForm}
                    className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
