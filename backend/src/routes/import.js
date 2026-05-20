const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// Download template Excel
router.get('/template', authenticate, (req, res) => {
  const headers = [
    'Nama Lengkap*',
    'NIK Balita*',
    'Tanggal Lahir* (YYYY-MM-DD)',
    'Jenis Kelamin* (L/P)',
    'Nama Orang Tua*',
  ];

  const contoh = [
    'Ahmad Fauzi',
    '1801234567890001',
    '2024-03-15',
    'L',
    'Budi Santoso',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, contoh]);

  // Lebar kolom
  ws['!cols'] = [
    { wch: 25 }, { wch: 20 }, { wch: 28 }, { wch: 22 }, { wch: 25 },
  ];

  // Style header (bold) — SheetJS community edition tidak support cell style,
  // tapi kita bisa tambahkan komentar/freeze pane
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Anak');

  // Sheet petunjuk
  const petunjuk = [
    ['PETUNJUK PENGISIAN'],
    [''],
    ['Kolom', 'Keterangan', 'Contoh'],
    ['Nama Lengkap*', 'Nama lengkap balita (wajib)', 'Ahmad Fauzi'],
    ['NIK Balita*', 'NIK 16 digit (wajib, harus unik)', '1801234567890001'],
    ['Tanggal Lahir*', 'Format: YYYY-MM-DD (wajib)', '2024-03-15'],
    ['Jenis Kelamin*', 'L untuk Laki-laki, P untuk Perempuan (wajib)', 'L'],
    ['Nama Orang Tua*', 'Nama ayah atau ibu (wajib)', 'Budi Santoso'],
    [''],
    ['CATATAN:'],
    ['- Kolom bertanda * wajib diisi'],
    ['- Jangan ubah baris pertama (header)'],
    ['- NIK yang sudah ada di sistem akan dilewati (tidak duplikat)'],
    ['- Hapus baris contoh sebelum import, atau biarkan (akan dilewati jika NIK sudah ada)'],
  ];

  const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjuk);
  wsPetunjuk['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="template_import_anak.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Import Excel
router.post('/anak', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

  let wb;
  try {
    wb = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
  } catch {
    return res.status(400).json({ message: 'File tidak valid, pastikan format .xlsx' });
  }

  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

  if (rows.length === 0) {
    return res.status(400).json({ message: 'File kosong atau format tidak sesuai template' });
  }

  const results = { berhasil: 0, dilewati: 0, gagal: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // baris Excel (header di baris 1)

    // Ambil nilai dari header kolom (fleksibel, cari key yang cocok)
    const get = (...keys) => {
      for (const k of keys) {
        const found = Object.keys(row).find(rk => rk.toLowerCase().includes(k.toLowerCase()));
        if (found && row[found] !== '') return String(row[found]).trim();
      }
      return '';
    };

    const namaLengkap = get('nama lengkap', 'nama');
    const nik = get('nik balita', 'nik') || null;
    const tglLahirRaw = get('tanggal lahir');
    const jenisKelamin = get('jenis kelamin').toUpperCase();
    const namaOrangtua = get('orang tua', 'ortu');

    // Validasi wajib
    const errors = [];
    if (!namaLengkap) errors.push('Nama Lengkap kosong');
    if (!tglLahirRaw) errors.push('Tanggal Lahir kosong');
    if (!['L', 'P'].includes(jenisKelamin)) errors.push('Jenis Kelamin harus L atau P');
    if (!namaOrangtua) errors.push('Nama Orang Tua kosong');

    if (errors.length > 0) {
      results.gagal.push({ baris: rowNum, nik: nik || '-', nama: namaLengkap || '-', alasan: errors.join(', ') });
      continue;
    }

    // Parse tanggal
    let tanggalLahir;
    try {
      if (tglLahirRaw instanceof Date) {
        tanggalLahir = tglLahirRaw;
      } else {
        tanggalLahir = new Date(tglLahirRaw);
        if (isNaN(tanggalLahir)) throw new Error();
      }
    } catch {
      results.gagal.push({ baris: rowNum, nik, nama: namaLengkap, alasan: 'Format tanggal tidak valid (gunakan YYYY-MM-DD)' });
      continue;
    }

    try {
      // Cek duplikat hanya jika NIK diisi
      if (nik) {
        const existing = await prisma.anak.findUnique({ where: { nik } });
        if (existing) {
          results.dilewati++;
          continue;
        }
      }

      await prisma.anak.create({
        data: {
          nik,
          namaLengkap,
          tanggalLahir,
          jenisKelamin: jenisKelamin === 'L' ? 'L' : 'P',
          namaOrangtua,
        },
      });
      results.berhasil++;

    } catch (err) {
      results.gagal.push({ baris: rowNum, nik, nama: namaLengkap, alasan: err.message });
    }
  }

  res.json({
    message: `Import selesai: ${results.berhasil} berhasil, ${results.dilewati} dilewati, ${results.gagal.length} gagal`,
    ...results,
  });
});

module.exports = router;
