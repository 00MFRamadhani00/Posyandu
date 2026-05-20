# Posyandu App — Sistem Informasi Posyandu

Aplikasi web untuk mengelola data posyandu secara digital, menggantikan pencatatan manual di buku registrasi, buku timbang, dan daftar hadir.

> **Versi ini menggunakan SQLite** — tidak memerlukan XAMPP atau MySQL. Database tersimpan langsung di dalam folder aplikasi.

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

### Cara Termudah — Installer (Direkomendasikan)

> Cocok untuk pengguna yang tidak terbiasa dengan terminal atau instalasi manual.

1. Jalankan file **`Setup Posyandu.exe`**
2. Klik **Next → Install** dan tunggu hingga selesai
   - Jika Node.js belum terinstall, akan diinstall otomatis
   - Akan muncul jendela hitam yang menampilkan proses setup — tunggu sampai selesai lalu tekan sembarang tombol
3. Selesai — shortcut **Posyandu App** muncul di Desktop

**Setiap hari:**
1. Double-click shortcut **Posyandu App** di Desktop
2. Browser akan terbuka otomatis
3. Selesai menggunakan → tekan tombol apa saja di jendela hitam → aplikasi mati

---

### Cara Manual (tanpa installer)

**Prasyarat:** [Node.js](https://nodejs.org) versi 18 ke atas

**Pertama kali (sekali saja):**
```bash
cd backend
npm install
npx prisma db push
node src/seed.js

cd ../frontend
npm install
npm run build
```

Atau double-click **`Setup Pertama Kali.bat`**.

**Setiap hari:**

Double-click **`Jalankan Posyandu.bat`**, atau:
```bash
cd backend
node src/index.js
```

Buka browser: `http://localhost:3001`

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

Akses halaman admin melalui tombol **Login Admin** di halaman publik, atau langsung ke `/login`

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
2. Tabel menampilkan semua balita yang masih aktif pada bulan tersebut
3. Isi kolom **Berat (kg)**, **Tinggi (cm)**, **LL (cm)**, **LK (cm)** per baris anak
4. Kolom **NTOB** otomatis terisi berdasarkan perbandingan dengan bulan sebelumnya — bisa diubah manual via dropdown jika perlu
5. Klik tombol **Simpan** di ujung kanan baris untuk menyimpan data anak tersebut
6. Ulangi untuk setiap anak

**Keterangan kolom:**
| Kolom | Keterangan |
|---|---|
| BL/PB | Berat Lahir (kg) / Panjang Lahir (cm) — diambil dari data anak |
| BB | Berat Badan bulan ini (kg) |
| TB | Tinggi Badan bulan ini (cm) |
| LL | Lingkar Lengan (cm) |
| LK | Lingkar Kepala (cm) |
| NTOB | Status penimbangan — lihat keterangan di bawah |

**Keterangan NTOB:**
- **N** — Naik (berat bertambah dari bulan lalu)
- **T** — Turun atau Tetap (berat sama atau berkurang)
- **O** — Bulan lalu tidak timbang
- **B** — Bayi Baru (penimbangan pertama kali)

**Catatan:**
- Anak diurutkan berdasarkan **tanggal lahir** (tertua di atas), sesuai urutan buku timbang
- Anak tetap muncul di **bulan ulang tahunnya yang ke-5** sebagai penimbangan terakhir, lalu tidak muncul lagi bulan berikutnya
- Jika membuka bulan-bulan lalu, anak yang sudah masuk arsip tetap muncul sesuai kondisi saat itu
- Jika data bulan itu sudah ada, simpan ulang akan **memperbarui** data (tidak dobel)
- Klik **Print Buku Timbang** untuk mencetak format sesuai buku timbang asli

---

### Data Anak

Menampilkan master data semua anak yang terdaftar.

#### Tab Balita Aktif
Daftar anak yang saat ini **berusia di bawah 5 tahun**.

**Menambah anak secara manual:**
1. Klik tombol **+ Tambah Anak**
2. Isi form: Nama Lengkap, NIK (opsional), Tanggal Lahir, Jenis Kelamin, Nama Orang Tua
3. Isi **Berat Lahir** dan **Panjang Lahir** jika tersedia — akan ditampilkan di kolom BL/PB pada tabel pengukuran
4. NIK boleh dikosongkan jika belum keluar dari pemerintah daerah, bisa diisi nanti melalui tombol **Edit**
5. Klik **Simpan**

**Mengedit data anak:**
- Klik tombol **Edit** pada baris anak yang ingin diubah
- Semua field bisa diperbarui termasuk berat lahir dan panjang lahir

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
- **Informasi pribadi** — NIK, jenis kelamin, tanggal lahir, usia otomatis, nama orang tua, berat lahir, panjang lahir
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
2. Isi judul, tanggal, jam mulai, dan tempat
3. Klik **Simpan**

**Mencatat daftar hadir:**
1. Klik salah satu kegiatan di panel kiri
2. Isi nama peserta, alamat, dan keterangan (opsional) di form yang muncul
3. Klik **+ Tambah** untuk menambahkan ke daftar
4. Centang kolom **Hadir** pada baris peserta untuk menandai kehadiran

**Menghapus data:**
- Klik **Hapus** pada baris peserta untuk menghapus satu peserta dari daftar hadir
- Klik **Hapus kegiatan** di bawah nama kegiatan untuk menghapus kegiatan beserta seluruh daftar hadirnya

**Mencetak daftar hadir:**
- **Print TTD** — kolom tanda tangan kosong untuk ditandatangani saat acara
- **Print Checklist** — kolom centang otomatis berdasarkan status hadir yang sudah diinput

---

### Manajemen Pengguna (Khusus Admin)

Hanya dapat diakses oleh pengguna dengan role **Admin**.

**Menambah pengguna baru:**
1. Klik **+ Tambah Pengguna**
2. Isi nama lengkap, username, password, dan pilih role (Admin / Kader)
3. Klik **Simpan**

**Mengedit pengguna:**
1. Klik **Edit** pada baris pengguna
2. Ubah nama, username, atau role sesuai kebutuhan
3. Isi password baru jika ingin menggantinya — **kosongkan jika tidak ingin diubah**
4. Klik **Simpan**

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
| Tambah / edit / import anak | ✓ | ✓ |
| Lihat detail anak | ✓ | ✓ |
| Kelola kegiatan & hadir | ✓ | ✓ |
| Manajemen pengguna | ✓ | ✗ |

---

## Catatan Teknis

- Aplikasi berjalan **lokal** di komputer posyandu, tidak memerlukan koneksi internet
- Database menggunakan **SQLite** — tersimpan di `backend/prisma/database.db`, tidak perlu server database terpisah
- Filter usia 5 tahun berjalan otomatis berdasarkan tanggal sistem komputer — pastikan **tanggal & waktu komputer selalu tepat**
- **Backup data:** cukup salin file `backend/prisma/database.db` ke tempat aman secara berkala
