const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  const kegiatan = await prisma.kegiatan.findMany({
    orderBy: { tanggal: 'desc' },
    include: { _count: { select: { daftarHadir: true } } }
  });
  res.json(kegiatan);
});

router.post('/', authenticate, async (req, res) => {
  const kegiatan = await prisma.kegiatan.create({ data: req.body });
  res.json(kegiatan);
});

router.get('/:id/hadir', authenticate, async (req, res) => {
  const hadir = await prisma.daftarHadir.findMany({
    where: { kegiatanId: parseInt(req.params.id) },
    orderBy: { id: 'asc' }
  });
  res.json(hadir);
});

router.post('/:id/hadir', authenticate, async (req, res) => {
  const hadir = await prisma.daftarHadir.create({
    data: { ...req.body, kegiatanId: parseInt(req.params.id) }
  });
  res.json(hadir);
});

router.delete('/hadir/:hadirId', authenticate, async (req, res) => {
  await prisma.daftarHadir.delete({ where: { id: parseInt(req.params.hadirId) } });
  res.json({ message: 'Peserta dihapus' });
});

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.daftarHadir.deleteMany({ where: { kegiatanId: parseInt(req.params.id) } });
  await prisma.kegiatan.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Kegiatan dihapus' });
});

module.exports = router;
