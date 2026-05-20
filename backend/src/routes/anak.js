const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Public: get all anak (only nama, status)
router.get('/public', async (req, res) => {
  const { tahun, bulan } = req.query;
  const now = new Date();
  const b = parseInt(bulan) || now.getMonth() + 1;
  const t = parseInt(tahun) || now.getFullYear();

  const anak = await prisma.anak.findMany({
    where: { aktif: true },
    select: {
      id: true,
      namaLengkap: true,
      tanggalLahir: true,
      jenisKelamin: true,
      pengukuran: {
        where: { bulan: b, tahun: t },
        select: { beratBadan: true, tinggiBadan: true, tanggal: true }
      }
    },
    orderBy: { tanggalLahir: 'asc' }
  });
  res.json(anak);
});

// Protected: get all anak with full data
router.get('/', authenticate, async (req, res) => {
  const { arsip } = req.query;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const batas5Tahun = new Date(now);
  batas5Tahun.setFullYear(batas5Tahun.getFullYear() - 5);

  // arsip=true → anak yang sudah 5 tahun ke atas
  // default (arsip=false) → anak di bawah 5 tahun
  const where = arsip === 'true'
    ? { aktif: true, tanggalLahir: { lte: batas5Tahun } }
    : { aktif: true, tanggalLahir: { gt: batas5Tahun } };

  const anak = await prisma.anak.findMany({
    where,
    orderBy: { tanggalLahir: 'asc' }
  });
  res.json(anak);
});

// Protected: get single anak with all data
router.get('/:id', authenticate, async (req, res) => {
  const anak = await prisma.anak.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      pengukuran: { orderBy: [{ tahun: 'asc' }, { bulan: 'asc' }] },
      imunisasi: true,
      tindakan: { orderBy: { tanggal: 'desc' } }
    }
  });
  if (!anak) return res.status(404).json({ message: 'Anak tidak ditemukan' });
  res.json(anak);
});

// Create anak
router.post('/', authenticate, async (req, res) => {
  try {
    const anak = await prisma.anak.create({ data: req.body });
    res.json(anak);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update anak
router.put('/:id', authenticate, async (req, res) => {
  try {
    const anak = await prisma.anak.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(anak);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Soft delete
router.delete('/:id', authenticate, async (req, res) => {
  await prisma.anak.update({
    where: { id: parseInt(req.params.id) },
    data: { aktif: false }
  });
  res.json({ message: 'Anak dinonaktifkan' });
});

module.exports = router;
