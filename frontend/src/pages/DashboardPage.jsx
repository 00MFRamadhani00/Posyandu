import { useState, useEffect } from 'react'
import api from '../lib/api'

const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [tahun, setTahun] = useState(new Date().getFullYear())

  useEffect(() => {
    api.get(`/dashboard?bulan=${bulan}&tahun=${tahun}`)
      .then(res => setData(res.data))
      .catch(() => {})
  }, [bulan, tahun])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-2">
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
            {[2025, 2026, 2027].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Anak" value={data?.totalAnak ?? '-'} icon="👶" color="blue" />
        <StatCard label="Sudah Diukur" value={data?.sudahDiukur ?? '-'} icon="✅" color="green" />
        <StatCard label="Belum Diukur" value={data?.belumDiukur ?? '-'} icon="⏳" color="orange" />
        <StatCard label="Total Kegiatan" value={data?.totalKegiatan ?? '-'} icon="📋" color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500 text-sm">
          Data bulan <strong>{BULAN[bulan]} {tahun}</strong>
        </p>
        {data && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-gray-600 w-24">Cakupan</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{ width: `${data.totalAnak ? (data.sudahDiukur / data.totalAnak * 100) : 0}%` }}
                />
              </div>
              <div className="text-sm font-medium text-gray-700 w-12 text-right">
                {data.totalAnak ? Math.round(data.sudahDiukur / data.totalAnak * 100) : 0}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm mt-1 opacity-75">{label}</div>
    </div>
  )
}
