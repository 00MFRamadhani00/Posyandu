import { useState, useEffect } from 'react'
import api from '../lib/api'

const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function getStatus(berat, tinggi, tanggalLahir) {
  if (!berat) return { label: 'Belum Diukur', color: 'gray' }
  // Simple weight-for-age check (placeholder — real WHO standards should be used)
  return { label: 'Sudah Diukur', color: 'green' }
}

export default function PublicPage() {
  const [anak, setAnak] = useState([])
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get(`/anak/public?bulan=${bulan}&tahun=${tahun}`)
      .then(res => setAnak(res.data))
      .catch(() => {})
  }, [bulan, tahun])

  const filtered = anak.filter(a =>
    a.namaLengkap.toLowerCase().includes(search.toLowerCase())
  )

  const sudahDiukur = anak.filter(a => a.pengukuran.length > 0).length

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-green-700 text-white py-8 px-4 text-center">
        <h1 className="text-3xl font-bold">🏥 Posyandu</h1>
        <p className="text-green-200 mt-1">Status Tumbuh Kembang Balita</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-3 flex-wrap">
          <select
            value={bulan}
            onChange={e => setBulan(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {BULAN.slice(1).map((b, i) => (
              <option key={i+1} value={i+1}>{b}</option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={e => setTahun(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {[2025, 2026, 2027].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Cari nama..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-32"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{sudahDiukur}</p>
            <p className="text-sm text-gray-500">Sudah Diukur</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">{anak.length - sudahDiukur}</p>
            <p className="text-sm text-gray-500">Belum Diukur</p>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map(a => {
            const ukur = a.pengukuran[0]
            return (
              <div key={a.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{a.namaLengkap}</p>
                  <p className="text-xs text-gray-400">{a.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                {ukur ? (
                  <div className="text-right">
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      ✓ Diukur
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{ukur.beratBadan} kg · {ukur.tinggiBadan} cm</p>
                  </div>
                ) : (
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                    Belum diukur
                  </span>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-8">Tidak ada data</div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-green-600 hover:underline">
            Login Admin →
          </a>
        </div>
      </div>
    </div>
  )
}
