const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Update/create imunisasi for a child
router.post('/', authenticate, async (req, res) => {
  const { anakId, jenis, tanggal, sudahDiberikan } = req.body;
  try {
    const imunisasi = await prisma.imunisasi.upsert({
      where: { anakId_jenis: { anakId, jenis } },
      update: { tanggal: tanggal ? new Date(tanggal) : null, sudahDiberikan },
      create: { anakId, jenis, tanggal: tanggal ? new Date(tanggal) : null, sudahDiberikan }
    });
    res.json(imunisasi);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
