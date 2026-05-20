import { useState, useEffect } from 'react'
import api from '../lib/api'
import { printWindow } from '../lib/print'

const BULAN_LIST = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default function PengukuranPage() {
  const [data, setData] = useState([])
  const [bulan, setBulan] = useState(new Date().getMonth() + 1)
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [saving, setSaving] = useState({})
  const [edits, setEdits] = useState({})

  const load = () => {
    api.get(`/pengukuran?bulan=${bulan}&tahun=${tahun}`).then(r => {
      setData(r.data)
      const init = {}
      r.data.forEach(anak => {
        const p = anak.pengukuran[0] || {}
        init[anak.id] = {
          beratBadan: p.beratBadan ?? '',
          tinggiBadan: p.tinggiBadan ?? '',
          lingkarLengan: p.lingkarLengan ?? '',
          lingkarKepala: p.lingkarKepala ?? '',
          ntob: p.ntob ?? '',
        }
      })
      setEdits(init)
    })
  }

  useEffect(() => { load() }, [bulan, tahun])

  const handleChange = (anakId, field, value) => {
    setEdits(prev => {
      const updated = { ...prev[anakId], [field]: value }
      // Auto-fill NTOB saat beratBadan berubah, hanya jika belum diset manual
      if (field === 'beratBadan') {
        const anak = data.find(a => a.id === anakId)
        if (anak) {
          updated.ntob = hitungNTOB(anak, value)
        }
      }
      return { ...prev, [anakId]: updated }
    })
  }

  const handleSave = async (anakId) => {
    setSaving(prev => ({ ...prev, [anakId]: true }))
    const e = edits[anakId]
    try {
      await api.post('/pengukuran', {
        anakId,
        bulan,
        tahun,
        tanggal: new Date(tahun, bulan - 1, 1).toISOString(),
        beratBadan: e.beratBadan ? parseFloat(e.beratBadan) : null,
        tinggiBadan: e.tinggiBadan ? parseFloat(e.tinggiBadan) : null,
        lingkarLengan: e.lingkarLengan ? parseFloat(e.lingkarLengan) : null,
        lingkarKepala: e.lingkarKepala ? parseFloat(e.lingkarKepala) : null,
        ntob: e.ntob || null,
      })
    } finally {
      setSaving(prev => ({ ...prev, [anakId]: false }))
    }
  }

  const hitungNTOB = (a, currBB) => {
    const prev = a.prevPengukuran
    const total = a.totalPengukuran
    const hasCurrentSaved = !!a.pengukuran[0]
    if (currBB == null || currBB === '') return ''
    const bb = typeof currBB === 'string' ? parseFloat(currBB) : currBB
    if (isNaN(bb)) return ''
    const isBaruBaru = total === 0 || (total === 1 && hasCurrentSaved && !prev)
    if (isBaruBaru) return 'B'
    if (!prev || prev.beratBadan == null) return 'O'
    if (bb > prev.beratBadan) return 'N'
    return 'T'
  }

  const handlePrint = () => {
    const judul = `Buku Timbang — ${BULAN_LIST[bulan]} ${tahun}`
    const rows = data.map((a, i) => {
      const p = a.pengukuran[0] || {}
      const ntob = hitungNTOB(a, (p || {}).beratBadan)
      return `
        <tr>
          <td class="center">${i + 1}</td>
          <td>${a.namaLengkap}</td>
          <td>${a.namaOrangtua}</td>
          <td class="center">${a.jenisKelamin}</td>
          <td class="center">${a.beratLahir != null || a.panjangLahir != null ? `${a.beratLahir ?? '?'} / ${a.panjangLahir ?? '?'}` : ''}</td>
          <td class="center">${p.beratBadan ?? ''}</td>
          <td class="center">${p.tinggiBadan ?? ''}</td>
          <td class="center">${p.lingkarKepala ?? ''}</td>
          <td class="center">${p.lingkarLengan ?? ''}</td>
          <td class="center"><b>${ntob}</b></td>
        </tr>`
    }).join('')

    printWindow(judul, `
      <h2>BUKU TIMBANG POSYANDU</h2>
      <h3>${BULAN_LIST[bulan]} ${tahun}</h3>
      <table>
        <thead>
          <tr>
            <th style="width:30px">NO</th>
            <th>NAMA ANAK</th>
            <th>NAMA ORTU</th>
            <th style="width:35px">L/P</th>
            <th style="width:55px">BL/PB</th>
            <th style="width:50px">BB (kg)</th>
            <th style="width:50px">TB (cm)</th>
            <th style="width:50px">LK (cm)</th>
            <th style="width:50px">LL (cm)</th>
            <th style="width:45px">NTOB</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:14px; font-size:10px; color:#555">
        <b>Keterangan NTOB:</b> N = Naik &nbsp;|&nbsp; T = Turun/Tetap &nbsp;|&nbsp; O = Bulan lalu tidak timbang &nbsp;|&nbsp; B = Bayi Baru
      </div>
    `)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengukuran Bulanan</h1>
        <div className="flex gap-2 items-center">
          <select value={bulan} onChange={e => setBulan(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm">
            {BULAN_LIST.slice(1).map((b, i) => (
              <option key={i+1} value={i+1}>{b}</option>
            ))}
          </select>
          <select value={tahun} onChange={e => setTahun(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm">
            {[2025, 2026, 2027].map(t => <option key={t}>{t}</option>)}
          </select>
          <button
            onClick={handlePrint}
            className="border border-gray-400 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            🖨️ Print Buku Timbang
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-800">
              <tr>
                <th className="px-4 py-3 text-left sticky left-0 bg-green-50">No</th>
                <th className="px-4 py-3 text-left sticky left-8 bg-green-50">Nama Anak</th>
                <th className="px-4 py-3 text-left">L/P</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Tgl Lahir</th>
                <th className="px-4 py-3 text-left">Orang Tua</th>
                <th className="px-4 py-3 text-center">BL/PB</th>
                <th className="px-4 py-3 text-center">Berat (kg)</th>
                <th className="px-4 py-3 text-center">Tinggi (cm)</th>
                <th className="px-4 py-3 text-center">LL (cm)</th>
                <th className="px-4 py-3 text-center">LK (cm)</th>
                <th className="px-4 py-3 text-center">NTOB</th>
                <th className="px-4 py-3 text-center">Simpan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((anak, i) => {
                const e = edits[anak.id] || {}
                const isSaved = saving[anak.id]
                return (
                  <tr key={anak.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{anak.namaLengkap}</td>
                    <td className="px-4 py-2">{anak.jenisKelamin}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{new Date(anak.tanggalLahir).toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-2 text-gray-500">{anak.namaOrangtua}</td>
                    <td className="px-4 py-2 text-center text-gray-600 text-xs whitespace-nowrap">
                      {anak.beratLahir != null || anak.panjangLahir != null
                        ? `${anak.beratLahir ?? '?'} / ${anak.panjangLahir ?? '?'}`
                        : <span className="text-gray-300">—</span>}
                    </td>
                    {['beratBadan', 'tinggiBadan', 'lingkarLengan', 'lingkarKepala'].map(field => (
                      <td key={field} className="px-2 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={e[field] ?? ''}
                          onChange={ev => handleChange(anak.id, field, ev.target.value)}
                          className="w-20 border rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          placeholder="-"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      {(() => {
                        const colors = { N: 'text-green-600 font-bold', T: 'text-red-500 font-bold', O: 'text-yellow-600 font-bold', B: 'text-blue-500 font-bold' }
                        return (
                          <select
                            value={e.ntob ?? ''}
                            onChange={ev => handleChange(anak.id, 'ntob', ev.target.value)}
                            className={`border rounded px-1 py-1 text-sm w-16 text-center focus:outline-none focus:ring-1 focus:ring-green-500 ${colors[e.ntob] ?? 'text-gray-400'}`}
                          >
                            <option value="">—</option>
                            <option value="N">N</option>
                            <option value="T">T</option>
                            <option value="O">O</option>
                            <option value="B">B</option>
                          </select>
                        )
                      })()}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleSave(anak.id)}
                        disabled={isSaved}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSaved ? '...' : 'Simpan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && (
                <tr><td colSpan={12} className="text-center py-8 text-gray-400">Tidak ada data anak</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
