const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  const now = new Date();
  const bulan = parseInt(req.query.bulan) || now.getMonth() + 1;
  const tahun = parseInt(req.query.tahun) || now.getFullYear();

  const [totalAnak, sudahDiukur, kegiatan] = await Promise.all([
    prisma.anak.count({ where: { aktif: true } }),
    prisma.pengukuran.count({ where: { bulan, tahun } }),
    prisma.kegiatan.count()
  ]);

  res.json({
    totalAnak,
    sudahDiukur,
    belumDiukur: totalAnak - sudahDiukur,
    totalKegiatan: kegiatan,
    bulan,
    tahun
  });
});

module.exports = router;
