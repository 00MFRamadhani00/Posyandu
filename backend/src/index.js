require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const anakRoutes = require('./routes/anak');
const pengukuranRoutes = require('./routes/pengukuran');
const imunisasiRoutes = require('./routes/imunisasi');
const kegiatanRoutes = require('./routes/kegiatan');
const dashboardRoutes = require('./routes/dashboard');
const importRoutes = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve frontend build (mode produksi)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.use('/api/auth', authRoutes);
app.use('/api/anak', anakRoutes);
app.use('/api/pengukuran', pengukuranRoutes);
app.use('/api/imunisasi', imunisasiRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/import', importRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Semua route non-API arahkan ke frontend (React Router)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
