import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function AnakPage() {
  const [tab, setTab] = useState('aktif')
  const [anak, setAnak] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null) // null = tambah baru, object = edit
  const [search, setSearch] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef()
  const [form, setForm] = useState({
    nik: '', namaLengkap: '', tanggalLahir: '', jenisKelamin: 'L',
    namaOrangtua: '', beratLahir: '', panjangLahir: ''
  })

  const openEdit = (a) => {
    setEditTarget(a)
    setForm({
      nik: a.nik ?? '',
      namaLengkap: a.namaLengkap,
      tanggalLahir: new Date(a.tanggalLahir).toISOString().slice(0, 10),
      jenisKelamin: a.jenisKelamin,
      namaOrangtua: a.namaOrangtua,
      beratLahir: a.beratLahir ?? '',
      panjangLahir: a.panjangLahir ?? '',
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditTarget(null)
    setForm({ nik: '', namaLengkap: '', tanggalLahir: '', jenisKelamin: 'L', namaOrangtua: '', beratLahir: '', panjangLahir: '' })
  }

  const load = () => {
    const arsip = tab === 'arsip' ? 'true' : 'false'
    api.get(`/anak?arsip=${arsip}`).then(r => setAnak(r.data))
  }
  useEffect(() => { load() }, [tab])

  const handleDownloadTemplate = async () => {
    const res = await api.get('/import/template', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_import_anak.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/import/anak', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportResult(res.data)
      load()
    } catch (err) {
      setImportResult({ message: err.response?.data?.message || 'Import gagal', berhasil: 0, dilewati: 0, gagal: [] })
    } finally {
      setImporting(false)
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const payload = {
      ...form,
      nik: form.nik || null,
      tanggalLahir: new Date(form.tanggalLahir).toISOString(),
      beratLahir: form.beratLahir ? parseFloat(form.beratLahir) : null,
      panjangLahir: form.panjangLahir ? parseFloat(form.panjangLahir) : null,
    }
    try {
      if (editTarget) {
        await api.put(`/anak/${editTarget.id}`, payload)
      } else {
        await api.post('/anak', payload)
      }
      closeForm()
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan')
    }
  }

  const filtered = anak.filter(a =>
    a.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (a.nik && a.nik.includes(search))
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Anak</h1>
        {tab === 'aktif' && (
          <div className="flex gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="border border-green-700 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 text-sm font-medium"
            >
              ⬇ Download Template
            </button>
            <label className={`border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium cursor-pointer ${importing ? 'opacity-50 pointer-events-none' : ''}`}>
              {importing ? '⏳ Mengimpor...' : '📂 Import Excel'}
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            </label>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium"
            >
              + Tambah Anak
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        <button
          onClick={() => { setTab('aktif'); setSearch('') }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'aktif' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Balita Aktif
        </button>
        <button
          onClick={() => { setTab('arsip'); setSearch('') }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'arsip' ? 'border-gray-500 text-gray-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Arsip
        </button>
      </div>

      {/* Info arsip */}
      {tab === 'arsip' && (
        <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
          Anak-anak berikut sudah berusia 5 tahun ke atas dan tidak lagi aktif dalam kegiatan posyandu. Riwayat data masih bisa dilihat.
        </div>
      )}

      {/* Hasil Import */}
      {importResult && (
        <div className={`mb-4 p-4 rounded-xl border text-sm ${importResult.gagal?.length > 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">{importResult.message}</p>
            <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-green-700">✓ {importResult.berhasil} berhasil</span>
            <span className="text-gray-500">⟳ {importResult.dilewati} dilewati (NIK duplikat)</span>
            {importResult.gagal?.length > 0 && <span className="text-red-600">✗ {importResult.gagal.length} gagal</span>}
          </div>
          {importResult.gagal?.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-medium text-red-700">Detail gagal:</p>
              {importResult.gagal.map((f, i) => (
                <p key={i} className="text-xs text-red-600">
                  Baris {f.baris} ({f.nama}): {f.alasan}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau NIK..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm w-full max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className={`text-sm ${tab === 'arsip' ? 'bg-gray-50 text-gray-600' : 'bg-green-50 text-green-800'}`}>
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NIK</th>
              <th className="px-4 py-3 text-left">L/P</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Tgl Lahir</th>
              <th className="px-4 py-3 text-left">Orang Tua</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a, i) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">
                  {a.namaLengkap}
                  {tab === 'arsip' && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Arsip</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{a.nik ?? '-'}</td>
                <td className="px-4 py-3">{a.jenisKelamin}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(a.tanggalLahir).toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-gray-500">{a.namaOrangtua}</td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Link
                    to={`/admin/anak/${a.id}`}
                    className="text-green-600 hover:underline text-xs"
                  >
                    Detail →
                  </Link>
                  <button
                    onClick={() => openEdit(a)}
                    className="text-blue-500 hover:underline text-xs"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-4">{editTarget ? 'Edit Data Anak' : 'Tambah Data Anak'}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
                    <input required value={form.namaLengkap} onChange={e => setForm({...form, namaLengkap: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">NIK Balita <span className="text-gray-400 font-normal">(opsional)</span></label>
                    <input value={form.nik} onChange={e => setForm({...form, nik: e.target.value})}
                      placeholder="Bisa diisi nanti jika belum keluar"
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1 font-mono" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir *</label>
                    <input required type="date" value={form.tanggalLahir} onChange={e => setForm({...form, tanggalLahir: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Jenis Kelamin *</label>
                    <select value={form.jenisKelamin} onChange={e => setForm({...form, jenisKelamin: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Nama Orang Tua *</label>
                    <input required value={form.namaOrangtua} onChange={e => setForm({...form, namaOrangtua: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Berat Lahir (kg) <span className="text-gray-400 font-normal">(opsional)</span></label>
                    <input type="number" step="0.01" value={form.beratLahir} onChange={e => setForm({...form, beratLahir: e.target.value})}
                      placeholder="contoh: 3.2" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Panjang Lahir (cm) <span className="text-gray-400 font-normal">(opsional)</span></label>
                    <input type="number" step="0.1" value={form.panjangLahir} onChange={e => setForm({...form, panjangLahir: e.target.value})}
                      placeholder="contoh: 49" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 text-sm font-medium">
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
