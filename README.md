# DSS Analytics (Decision Support System)

DSS Analytics adalah sebuah aplikasi *Business Intelligence* (BI) kustom berbasis web yang dibangun untuk memvisualisasikan data dan mendukung pengambilan keputusan tingkat manajerial. 

Berbeda dengan sistem BI standar (seperti Metabase), sistem ini mengutamakan **Role-Based Access Control (RBAC)** yang sangat ketat, di mana sebuah grafik hanya dapat dilihat oleh level jabatan tertentu (misal: hanya CEO, atau hanya Manajer HR).

---

## ✨ Fitur Utama

- **🛡️ Multi-Role Security:** Sistem autentikasi tangguh dengan pembagian peran spesifik (CEO, Manager HR, Manager IT, Data Analyst).
- **📊 Hybrid Chart Builder:** Data Analyst dapat membuat grafik menggunakan dua metode:
  - **Visual GUI Builder:** Untuk pembuatan grafik cepat tanpa kode (*no-code*).
  - **SQL Editor:** Untuk mengeksekusi *raw query* kompleks (seperti `JOIN` antar tabel).
- **📱 Dynamic Dashboard:** *Dashboard* secara otomatis merender grafik sesuai dengan *Role* pengguna yang masuk. Tidak ada risiko kebocoran data antar departemen.
- **🔗 Iframe Embedding:** Mendukung pembuatan *Token Embed* publik untuk menempelkan grafik ke website eksternal secara aman tanpa perlu *login*.
- **🔐 Keamanan OTP (One-Time Password):** Sistem pemulihan kata sandi (Lupa Sandi) dan pengubahan kata sandi di Pengaturan dilindungi oleh OTP 6-digit. OTP divalidasi menggunakan *Cache* (kedaluwarsa dalam 5 menit) dan dikirim via Email HTML bergaya *Dark Mode* untuk mencegah *session hijacking*.
- **🌙 Tampilan Global Dark Mode:** Antarmuka pengguna dirancang menggunakan *Dark Mode* modern yang mewah, responsif di seluruh perangkat (Desktop, Tablet, Mobile), dan dilengkapi notifikasi halus menggunakan *SweetAlert2*.

---

## 💻 Tech Stack

- **Frontend:** React.js, Vite, React Router, Axios, Lucide Icons.
- **Backend:** Laravel 11, Laravel Sanctum (Token-Based API Auth), MySQL.
- **Caching & Email:** Laravel Cache (untuk memori OTP & Query) & SMTP Mailer.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Pastikan komputer Anda sudah terinstal:
- PHP (minimal v8.2) & Composer
- Node.js & npm
- MySQL (disarankan menggunakan **Laragon** atau XAMPP)

### 1. Setup Backend (Laravel)
1. Buka terminal, masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Instal dependensi PHP:
   ```bash
   composer install
   ```
3. Salin file `.env.example` menjadi `.env` dan atur koneksi database Anda:
   ```bash
   cp .env.example .env
   ```
   *(Pastikan membuat database kosong di MySQL Anda, misalnya bernama `dss_project`, lalu sesuaikan `DB_DATABASE` di file `.env`)*
4. Atur konfigurasi SMTP di file `.env` untuk mengaktifkan fitur Email OTP (Gunakan kredensial Gmail + App Password).
5. Generate application key dan jalankan migrasi beserta *Seeder* untuk membuat akun awal:
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```
6. Jalankan server backend:
   ```bash
   php artisan serve
   ```
   *(Server akan berjalan di `http://127.0.0.1:8000`)*

### 2. Setup Frontend (React)
1. Buka terminal baru, masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Instal dependensi JavaScript:
   ```bash
   npm install
   ```
3. Jalankan server frontend:
   ```bash
   npm run dev
   ```
   *(Aplikasi frontend bisa diakses di browser, biasanya pada `http://localhost:5173`)*