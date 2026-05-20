import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../lib/api'

const BULAN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const IMUNISASI_LIST = ['HB', 'BCG', 'DPT1', 'DPT2', 'DPT3', 'IPV', 'CAMPAK', 'POLIO1', 'POLIO2', 'POLIO3', 'POLIO4']
const TINDAKAN_LABEL = { VITAMIN_A: 'Vitamin A', OBAT_CACING: 'Obat Cacing' }

export default function AnakDetailPage() {
  const { id } = useParams()
  const [anak, setAnak] = useState(null)

  const load = () => api.get(`/anak/${id}`).then(r => setAnak(r.data))
  useEffect(() => { load() }, [id])

  if (!anak) return <div className="p-6 text-gray-400">Memuat data...</div>

  const batas5Tahun = new Date()
  batas5Tahun.setFullYear(batas5Tahun.getFullYear() - 5)
  const isArsip = new Date(anak.tanggalLahir) <= batas5Tahun

  const chartData = anak.pengukuran.map(p => ({
    name: `${BULAN[p.bulan]} ${p.tahun}`,
    Berat: p.beratBadan,
    Tinggi: p.tinggiBadan,
  }))

  const imunMap = {}
  anak.imunisasi.forEach(i => { imunMap[i.jenis] = i })

  const handleImunisasi = async (jenis, sudah) => {
    await api.post('/imunisasi', {
      anakId: anak.id,
      jenis,
      sudahDiberikan: sudah,
      tanggal: sudah ? new Date().toISOString() : null
    })
    load()
  }

  const handleTindakan = async (jenis) => {
    await api.post(`/anak/${id}/tindakan`, { jenis, tanggal: new Date().toISOString() }).catch(() => {})
    // We'll handle tindakan via direct prisma in a simple way
    load()
  }

  const usia = () => {
    const lahir = new Date(anak.tanggalLahir)
    const now = new Date()
    const bulan = (now.getFullYear() - lahir.getFullYear()) * 12 + (now.getMonth() - lahir.getMonth())
    if (bulan < 12) return `${bulan} bulan`
    return `${Math.floor(bulan / 12)} tahun ${bulan % 12} bulan`
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/admin/anak" className="text-green-600 hover:underline text-sm">← Data Anak</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-800">{anak.namaLengkap}</h1>
        {isArsip && (
          <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">Arsip</span>
        )}
      </div>

      {isArsip && (
        <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
          Anak ini sudah berusia 5 tahun ke atas dan tidak lagi aktif dalam kegiatan posyandu. Data riwayat ditampilkan hanya untuk referensi.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Info */}
        <div className="bg-white rounded-xl shadow p-4 lg:col-span-1">
          <h2 className="font-semibold text-gray-700 mb-3">Informasi Anak</h2>
          <div className="space-y-2 text-sm">
            <Row label="NIK" value={anak.nik} mono />
            <Row label="Jenis Kelamin" value={anak.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <Row label="Tanggal Lahir" value={new Date(anak.tanggalLahir).toLocaleDateString('id-ID')} />
            <Row label="Usia" value={usia()} />
            <Row label="Orang Tua" value={anak.namaOrangtua} />
            {anak.beratLahir && <Row label="Berat Lahir" value={`${anak.beratLahir} kg`} />}
            {anak.panjangLahir && <Row label="Panjang Lahir" value={`${anak.panjangLahir} cm`} />}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h2 className="font-semibold text-gray-700 mb-3">Grafik Pertumbuhan</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Berat" stroke="#16a34a" strokeWidth={2} dot />
                <Line type="monotone" dataKey="Tinggi" stroke="#2563eb" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-8 text-sm">Belum ada data pengukuran</div>
          )}
        </div>
      </div>

      {/* Imunisasi */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3">Status Imunisasi</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {IMUNISASI_LIST.map(jenis => {
            const done = imunMap[jenis]?.sudahDiberikan
            return (
              <button
                key={jenis}
                onClick={() => handleImunisasi(jenis, !done)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-colors ${
                  done ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                {done ? '✓ ' : ''}{jenis}
              </button>
            )
          })}
        </div>
      </div>

      {/* Riwayat Pengukuran */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-gray-700 mb-3">Riwayat Pengukuran</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Bulan</th>
              <th className="px-3 py-2 text-right">Berat (kg)</th>
              <th className="px-3 py-2 text-right">Tinggi (cm)</th>
              <th className="px-3 py-2 text-right">LL (cm)</th>
              <th className="px-3 py-2 text-right">LK (cm)</th>
              <th className="px-3 py-2 text-left">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {anak.pengukuran.map(p => (
              <tr key={p.id}>
                <td className="px-3 py-2">{BULAN[p.bulan]} {p.tahun}</td>
                <td className="px-3 py-2 text-right font-medium">{p.beratBadan ?? '-'}</td>
                <td className="px-3 py-2 text-right">{p.tinggiBadan ?? '-'}</td>
                <td className="px-3 py-2 text-right">{p.lingkarLengan ?? '-'}</td>
                <td className="px-3 py-2 text-right">{p.lingkarKepala ?? '-'}</td>
                <td className="px-3 py-2 text-gray-500 text-xs">{p.catatan ?? '-'}</td>
              </tr>
            ))}
            {anak.pengukuran.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-400">Belum ada pengukuran</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
