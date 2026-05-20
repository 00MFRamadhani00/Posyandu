import { useState, useEffect } from 'react'
import api from '../lib/api'
import { printWindow } from '../lib/print'

export default function KegiatanPage() {
  const [kegiatan, setKegiatan] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [hadir, setHadir] = useState([])
  const [form, setForm] = useState({ judul: '', tanggal: '', jam: '', tempat: '', keterangan: '' })
  const [hadirForm, setHadirForm] = useState({ nama: '', alamat: '', keterangan: '' })

  const load = () => api.get('/kegiatan').then(r => setKegiatan(r.data))

  useEffect(() => { load() }, [])

  const loadHadir = (id) => api.get(`/kegiatan/${id}/hadir`).then(r => setHadir(r.data))

  const handleSelect = (k) => {
    setSelected(k)
    loadHadir(k.id)
  }

  const handleSubmitKegiatan = async e => {
    e.preventDefault()
    await api.post('/kegiatan', { ...form, tanggal: new Date(form.tanggal).toISOString() })
    setShowForm(false)
    setForm({ judul: '', tanggal: '', jam: '', tempat: '', keterangan: '' })
    load()
  }

  const handleAddHadir = async e => {
    e.preventDefault()
    await api.post(`/kegiatan/${selected.id}/hadir`, hadirForm)
    setHadirForm({ nama: '', alamat: '', keterangan: '' })
    loadHadir(selected.id)
    load()
  }

  const handleDeleteKegiatan = async (k) => {
    if (!confirm(`Hapus kegiatan "${k.judul}" beserta seluruh daftar hadirnya?`)) return
    await api.delete(`/kegiatan/${k.id}`)
    setSelected(null)
    setHadir([])
    load()
  }

  const handleDeleteHadir = async (hadirId) => {
    if (!confirm('Hapus peserta ini dari daftar hadir?')) return
    await api.delete(`/kegiatan/hadir/${hadirId}`)
    loadHadir(selected.id)
    load()
  }

  const handlePrintHadir = () => {
    const tgl = new Date(selected.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    const rows = hadir.map((h, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td>${h.nama}</td>
        <td>${h.alamat ?? ''}</td>
        <td class="ttd"></td>
        <td>${h.keterangan ?? ''}</td>
      </tr>`
    ).join('')

    // Tambah baris kosong hingga minimal 20
    const extraRows = Math.max(0, 20 - hadir.length)
    const emptyRows = Array(extraRows).fill(`
      <tr>
        <td class="center">&nbsp;</td><td></td><td></td><td class="ttd"></td><td></td>
      </tr>`
    ).join('')

    printWindow(`Daftar Hadir — ${selected.judul}`, `
      <h2>DAFTAR HADIR KEGIATAN POSYANDU</h2>
      <h3>${selected.judul}</h3>
      <div class="info" style="margin-bottom:10px">
        <table style="border:none; width:auto">
          <tr>
            <td style="border:none; padding:2px 8px 2px 0; width:80px">Hari/Tanggal</td>
            <td style="border:none; padding:2px 4px">:</td>
            <td style="border:none; padding:2px 0">${tgl}</td>
          </tr>
          <tr>
            <td style="border:none; padding:2px 8px 2px 0">Jam</td>
            <td style="border:none; padding:2px 4px">:</td>
            <td style="border:none; padding:2px 0">${selected.jam ?? ''}</td>
          </tr>
          <tr>
            <td style="border:none; padding:2px 8px 2px 0">Tempat</td>
            <td style="border:none; padding:2px 4px">:</td>
            <td style="border:none; padding:2px 0">${selected.tempat ?? ''}</td>
          </tr>
        </table>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px">NO</th>
            <th>NAMA</th>
            <th>ALAMAT</th>
            <th style="width:100px">TANDA TANGAN</th>
            <th style="width:80px">KET</th>
          </tr>
        </thead>
        <tbody>${rows}${emptyRows}</tbody>
      </table>
    `)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kegiatan & Daftar Hadir</h1>
        <button onClick={() => setShowForm(true)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium">
          + Tambah Kegiatan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kegiatan list */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Daftar Kegiatan</h2>
          <div className="space-y-2">
            {kegiatan.map(k => (
              <div key={k.id}
                className={`rounded-lg border transition-colors ${
                  selected?.id === k.id ? 'border-green-500 bg-green-50' : 'border-gray-100'
                }`}>
                <button onClick={() => handleSelect(k)} className="w-full text-left p-3">
                  <p className="font-medium text-sm">{k.judul}</p>
                  <p className="text-xs text-gray-500">{new Date(k.tanggal).toLocaleDateString('id-ID')}</p>
                  {k.tempat && <p className="text-xs text-gray-400">{k.tempat}</p>}
                  <p className="text-xs text-green-600 mt-1">{k._count.daftarHadir} peserta</p>
                </button>
                <div className="px-3 pb-2">
                  <button
                    onClick={() => handleDeleteKegiatan(k)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Hapus kegiatan
                  </button>
                </div>
              </div>
            ))}
            {kegiatan.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada kegiatan</p>}
          </div>
        </div>

        {/* Daftar hadir */}
        {selected && (
          <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-700">{selected.judul}</h2>
              <button
                onClick={handlePrintHadir}
                className="border border-gray-400 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-xs font-medium"
              >
                🖨️ Print Daftar Hadir
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {new Date(selected.tanggal).toLocaleDateString('id-ID')}
              {selected.jam && ` · ${selected.jam}`}
              {selected.tempat && ` · ${selected.tempat}`}
            </p>

            {/* Form tambah peserta */}
            <form onSubmit={handleAddHadir} className="flex gap-2 mb-4 flex-wrap">
              <input required value={hadirForm.nama} onChange={e => setHadirForm({...hadirForm, nama: e.target.value})}
                placeholder="Nama peserta" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32" />
              <input value={hadirForm.alamat} onChange={e => setHadirForm({...hadirForm, alamat: e.target.value})}
                placeholder="Alamat" className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32" />
              <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">
                + Tambah
              </button>
            </form>

            {/* Tabel hadir */}
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">Alamat</th>
                  <th className="px-3 py-2 text-left">Keterangan</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hadir.map((h, i) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-2 font-medium">{h.nama}</td>
                    <td className="px-3 py-2 text-gray-500">{h.alamat ?? '-'}</td>
                    <td className="px-3 py-2 text-gray-500">{h.keterangan ?? '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDeleteHadir(h.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {hadir.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">Belum ada peserta</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4">Tambah Kegiatan</h2>
              <form onSubmit={handleSubmitKegiatan} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Judul Kegiatan *</label>
                  <input required value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tanggal *</label>
                    <input required type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Jam</label>
                    <input value={form.jam} onChange={e => setForm({...form, jam: e.target.value})}
                      placeholder="08:00 - 11:00" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tempat</label>
                  <input value={form.tempat} onChange={e => setForm({...form, tempat: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-800">
                    Simpan
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
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
