# Posyandu App — Sistem Informasi Posyandu

Aplikasi web untuk mengelola data posyandu secara digital, menggantikan pencatatan manual di buku registrasi, buku timbang, dan daftar hadir.

---

## Daftar Isi

- [Instalasi & Menjalankan Aplikasi](#instalasi--menjalankan-aplikasi)
- [Panduan Penggunaan](#panduan-penggunaan)
  - [Halaman Publik](#halaman-publik)
  - [Login](#login)
  - [Dashboard](#dashboard)
  - [Pengukuran Bulanan](#pengukuran-bulanan)
  - [Data Anak](#data-anak)
  - [Detail Anak](#detail-anak)
  - [Kegiatan & Daftar Hadir](#kegiatan--daftar-hadir)
  - [Manajemen Pengguna](#manajemen-pengguna-khusus-admin)
- [Peran Pengguna](#peran-pengguna)
- [Catatan Teknis](#catatan-teknis)

---

## Instalasi & Menjalankan Aplikasi

### Prasyarat
- [Node.js](https://nodejs.org) versi 18 ke atas
- [XAMPP](https://www.apachefriends.org) (untuk MySQL)

---

### Cara Mudah (Double-click, tanpa terminal)

> Cara ini direkomendasikan untuk pengguna sehari-hari.

**Pertama kali (sekali saja):**
1. Pastikan XAMPP sudah terinstall dan MySQL sudah pernah dijalankan minimal sekali
2. Double-click file **`Setup Pertama Kali.bat`**
3. Tunggu hingga selesai — proses ini menginstall semua kebutuhan, membuat database, dan membuat akun admin

**Setiap hari:**
1. Double-click file **`Jalankan Posyandu.bat`**
2. Browser akan terbuka otomatis menuju aplikasi
3. Selesai menggunakan → tekan tombol apa saja di jendela hitam → aplikasi mati

**Shortcut di desktop (opsional):**
- Klik kanan `Jalankan Posyandu.bat` → *Send to* → *Desktop (create shortcut)*

---

### Cara Manual (untuk developer)

**Pertama kali:**
```bash
# Jalankan MySQL via XAMPP terlebih dahulu

cd backend
npm install
npx prisma db push
node src/seed.js

cd ../frontend
npm install
npm run build
```

**Setiap hari:**
```bash
cd backend
node src/index.js
```

Buka browser dan akses: **URL Yang Anda Set**

> Untuk mode pengembangan (dengan hot reload), jalankan `npm run dev` di folder `backend` dan `frontend` secara terpisah, lalu akses **URL ANDA**

---

### Login Default (Pertama Kali)
| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |

> **Penting:** Segera ganti password setelah login pertama melalui menu Manajemen Pengguna.

---

## Panduan Penggunaan

### Halaman Publik

Dapat diakses siapa saja tanpa login

- Menampilkan daftar nama anak beserta status pengukuran bulan ini
- Dapat difilter berdasarkan bulan dan tahun
- Terdapat kolom pencarian nama
- Status ditampilkan sebagai:
  - **Sudah Diukur** (hijau) — lengkap dengan berat dan tinggi
  - **Belum diukur** (abu-abu)
- Tidak menampilkan data sensitif (NIK, data orang tua, dll.)

---

### Login

Akses halaman admin melalui tombol **Login Admin** di halaman publik, atau langsung ke **URL ANDA/login**

- Masukkan username dan password
- Sesi aktif selama **8 jam**, setelah itu otomatis keluar

---

### Dashboard

Halaman pertama setelah login. Menampilkan ringkasan data bulan yang dipilih:

| Kartu | Keterangan |
|---|---|
| Total Anak | Jumlah balita aktif (di bawah 5 tahun) |
| Sudah Diukur | Jumlah yang sudah diinput pengukurannya bulan ini |
| Belum Diukur | Jumlah yang belum diinput |
| Total Kegiatan | Jumlah kegiatan posyandu yang tercatat |

- Terdapat **progress bar cakupan** pengukuran bulan tersebut
- Gunakan dropdown bulan & tahun untuk melihat data bulan lain

---

### Pengukuran Bulanan

Menu utama untuk mencatat hasil penimbangan dan pengukuran setiap bulan.

**Cara mengisi pengukuran:**
1. Pilih bulan dan tahun di pojok kanan atas
2. Tabel menampilkan semua balita aktif yang belum berusia 5 tahun
3. Isi kolom **Berat (kg)**, **Tinggi (cm)**, **LL (cm)**, **LK (cm)**, dan **Catatan** per baris anak
4. Klik tombol **Simpan** di ujung kanan baris untuk menyimpan data anak tersebut
5. Ulangi untuk setiap anak

**Catatan:**
- Anak diurutkan berdasarkan **tanggal lahir** (tertua di atas), sesuai urutan buku timbang
- Anak yang sudah **genap 5 tahun hari ini** otomatis tidak muncul
- Filter usia berjalan **real-time** berdasarkan tanggal hari ini, tidak perlu input manual
- Jika data bulan itu sudah ada, simpan ulang akan **memperbarui** data (tidak dobel)

---

### Data Anak

Menampilkan master data semua anak yang terdaftar.

#### Tab Balita Aktif
Daftar anak yang saat ini **berusia di bawah 5 tahun**.

**Menambah anak secara manual:**
1. Klik tombol **+ Tambah Anak**
2. Isi form: Nama Lengkap, NIK (opsional), Tanggal Lahir, Jenis Kelamin, Nama Orang Tua
3. NIK boleh dikosongkan jika belum keluar dari pemerintah daerah, bisa diisi nanti
4. Klik **Simpan**

**Import data dari Excel (untuk data massal):**
1. Klik **Download Template** untuk mengunduh file Excel template
2. Buka file template, isi data anak di sheet **Data Anak** (lihat sheet **Petunjuk** untuk panduan)
3. Kolom wajib: Nama Lengkap, Tanggal Lahir (format `YYYY-MM-DD`), Jenis Kelamin (`L`/`P`), Nama Orang Tua
4. Simpan file, lalu klik **Import Excel** dan pilih file tersebut
5. Hasil import akan ditampilkan: berhasil, dilewati (NIK duplikat), dan gagal beserta alasannya

> Data dengan NIK yang sudah ada di sistem akan **dilewati otomatis** (tidak dobel).
> Data tanpa NIK akan selalu dimasukkan sebagai data baru.

#### Tab Arsip
Daftar anak yang sudah **berusia 5 tahun ke atas**. Perpindahan ke arsip terjadi **otomatis** tanpa perlu tindakan manual. Data riwayat pengukuran dan imunisasi tetap bisa dilihat melalui tombol **Detail**.

---

### Detail Anak

Klik **Detail →** pada baris anak untuk melihat halaman detail.

Berisi:
- **Informasi pribadi** — NIK, jenis kelamin, tanggal lahir, usia otomatis, nama orang tua
- **Grafik pertumbuhan** — berat dan tinggi per bulan dalam bentuk line chart
- **Status imunisasi** — 11 jenis vaksin (HB, BCG, DPT 1-3, IPV, Campak, Polio 1-4)
  - Klik tombol vaksin untuk toggle **sudah / belum diberikan**
- **Riwayat pengukuran** — semua data pengukuran bulanan dalam tabel

Jika anak sudah masuk **Arsip**, akan muncul banner keterangan dan badge "Arsip" di nama.

---

### Kegiatan & Daftar Hadir

Untuk mencatat kegiatan posyandu dan peserta yang hadir (kader, orang tua, dll.).

**Membuat kegiatan baru:**
1. Klik **+ Tambah Kegiatan**
2. Isi judul, tanggal, jam, dan tempat
3. Klik **Simpan**

**Mencatat daftar hadir:**
1. Klik salah satu kegiatan di panel kiri
2. Isi nama peserta dan alamat di form yang muncul
3. Klik **+ Tambah** untuk menambahkan ke daftar
4. Ulangi untuk setiap peserta

---

### Manajemen Pengguna (Khusus Admin)

Hanya dapat diakses oleh pengguna dengan role **Admin**.

**Menambah pengguna baru (Kader):**
1. Klik **+ Tambah Pengguna**
2. Isi nama lengkap, username, password, dan pilih role
3. Klik **Simpan**

**Menonaktifkan pengguna:**
- Klik **Nonaktifkan** pada baris pengguna yang ingin dinonaktifkan
- Pengguna yang dinonaktifkan tidak bisa login
- Klik **Aktifkan** untuk mengaktifkan kembali

> Akun Admin tidak bisa menonaktifkan akunnya sendiri.

---

## Peran Pengguna

| Fitur | Admin | Kader |
|---|---|---|
| Lihat halaman publik | ✓ | ✓ |
| Login | ✓ | ✓ |
| Dashboard | ✓ | ✓ |
| Input pengukuran | ✓ | ✓ |
| Tambah / import anak | ✓ | ✓ |
| Lihat detail anak | ✓ | ✓ |
| Kelola kegiatan & hadir | ✓ | ✓ |
| Manajemen pengguna | ✓ | ✗ |

---

## Catatan Teknis

- Aplikasi berjalan **lokal** di komputer posyandu, tidak memerlukan koneksi internet
- Data tersimpan di database MySQL melalui XAMPP
- Filter usia 5 tahun berjalan otomatis berdasarkan tanggal sistem komputer — pastikan **tanggal & waktu komputer selalu tepat**
