const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get pengukuran by bulan & tahun (for monthly table view)
router.get('/', authenticate, async (req, res) => {
  const { bulan, tahun } = req.query;
  const b = parseInt(bulan) || new Date().getMonth() + 1;
  const t = parseInt(tahun) || new Date().getFullYear();

  // Hitung bulan sebelumnya
  const prevB = b === 1 ? 12 : b - 1;
  const prevT = b === 1 ? t - 1 : t;

  // Filter usia: anak masuk selama bulan ulang tahunnya (awal bulan terpilih - 5 tahun)
  const refDate = new Date(t, b - 1, 1); // hari pertama bulan b
  refDate.setHours(0, 0, 0, 0);
  const batasLahir = new Date(refDate);
  batasLahir.setFullYear(refDate.getFullYear() - 5);

  const anak = await prisma.anak.findMany({
    where: {
      aktif: true,
      tanggalLahir: { gte: batasLahir }
    },
    orderBy: { tanggalLahir: 'asc' },
    include: {
      pengukuran: {
        where: { bulan: b, tahun: t }
      }
    }
  });

  const anakIds = anak.map(a => a.id);

  // Ambil pengukuran bulan sebelumnya untuk hitung NTOB
  const [prevList, countList] = await Promise.all([
    prisma.pengukuran.findMany({
      where: { anakId: { in: anakIds }, bulan: prevB, tahun: prevT }
    }),
    prisma.pengukuran.groupBy({
      by: ['anakId'],
      where: { anakId: { in: anakIds } },
      _count: { anakId: true }
    })
  ]);

  const prevMap = Object.fromEntries(prevList.map(p => [p.anakId, p]));
  const countMap = Object.fromEntries(countList.map(c => [c.anakId, c._count.anakId]));

  const result = anak.map(a => ({
    ...a,
    prevPengukuran: prevMap[a.id] || null,
    totalPengukuran: countMap[a.id] || 0
  }));

  res.json(result);
});

// Upsert pengukuran (insert or update)
router.post('/', authenticate, async (req, res) => {
  const { anakId, bulan, tahun, tanggal, beratBadan, tinggiBadan, lingkarLengan, lingkarKepala, ntob } = req.body;
  try {
    const pengukuran = await prisma.pengukuran.upsert({
      where: { anakId_bulan_tahun: { anakId, bulan, tahun } },
      update: { beratBadan, tinggiBadan, lingkarLengan, lingkarKepala, ntob: ntob || null, tanggal: new Date(tanggal) },
      create: { anakId, bulan, tahun, tanggal: new Date(tanggal), beratBadan, tinggiBadan, lingkarLengan, lingkarKepala, ntob: ntob || null }
    });
    res.json(pengukuran);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
