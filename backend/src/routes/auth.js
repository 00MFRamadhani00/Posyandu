const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.aktif) return res.status(401).json({ message: 'Username atau password salah' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Username atau password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, nama: user.nama, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all users (admin only)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, nama: true, role: true, aktif: true, createdAt: true }
  });
  res.json(users);
});

// Create user (admin only)
router.post('/users', authenticate, requireAdmin, async (req, res) => {
  const { username, password, nama, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, nama, role: role || 'KADER' },
      select: { id: true, username: true, nama: true, role: true }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Username sudah digunakan' });
  }
});

// Update user (admin only) — password opsional, kosong = tidak diubah
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  const { nama, username, role, password } = req.body;
  try {
    const data = { nama, username, role };
    if (password) data.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
      select: { id: true, username: true, nama: true, role: true, aktif: true }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Username sudah digunakan' });
  }
});

// Toggle user aktif (admin only)
router.patch('/users/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  const user = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data: { aktif: req.body.aktif },
    select: { id: true, username: true, nama: true, role: true, aktif: true }
  });
  res.json(user);
});

module.exports = router;
