# Product Requirements Document (PRD) v3 - Decision Support System (DSS) Custom BI Tool

**Tujuan Dokumen:** Menjadi blueprint (panduan utama) bagi Developer dan AI Agent (Antigravity/dll) dalam membangun aplikasi.

**Changelog dari v2:** Menambahkan mode *Hybrid Chart Builder* (GUI ala Metabase + SQL Editor), fitur Manajemen Profil & Reset Password, kebijakan *Strict Visual Analytics* (tanpa Tabel Log), fitur **Data Explorer** (Database Previewer), transisi ke **Dashboard Manual (Drag & Drop)**, dan migrasi library visualisasi ke **ECharts** (dengan 8 tipe grafik).

---

## 1. Problem Statement
Perusahaan membutuhkan sistem Business Intelligence (BI) untuk memvisualisasikan data guna mendukung pengambilan keputusan (DSS). Saat ini, tool yang ada di pasaran seperti Metabase memiliki kelemahan mendasar: Metabase berfokus penuh pada pembuatan grafik, namun **tidak memiliki sistem manajemen hak akses (role-based access) yang spesifik untuk distribusi grafik**.

Di dalam struktur organisasi, setiap level jabatan (seperti CEO dan Manajer) membutuhkan visualisasi data yang berbeda. Metabase tidak bisa membatasi "Grafik A hanya untuk CEO" atau "Grafik B hanya untuk Manajer" dalam satu environment yang terpusat. Oleh karena itu, dibutuhkan sebuah DSS buatan sendiri (*custom*) yang menggabungkan kemampuan *chart generation* dengan otorisasi *role-based* yang ketat.

## 2. Goals
Tujuan dari project ini adalah:
1. Membangun DSS (*Decision Support System*) *all-in-one* berbasis web yang berfungsi sebagai pembuat (*chart builder*) sekaligus penampil grafik.
2. Mengimplementasikan sistem otorisasi multi-role untuk memanajemen peruntukan grafik secara spesifik (berdasarkan jabatan/tingkatan manajerial).
3. Menyediakan modul di mana kreator dapat mengeksekusi *query* database dan merendernya menjadi grafik.
4. Membangun fitur **Embed Iframe**, yang memungkinkan grafik-grafik tertentu di-publish dan ditempelkan (embedded) ke website atau sistem perusahaan lain dengan memanggil API.

## 3. Target Users
1. **End User (Eksekutif/Manajerial)**
   - *Contoh:* CEO, Manajer, SPV.
   - *Peran:* Hanya bertindak sebagai "Viewer" atau konsumen data. Mereka login untuk melihat dashboard yang berisi grafik-grafik yang sudah difilter sesuai dengan hak akses (jabatan) mereka.
2. **Admin/Creator (Data Analis)**
   - *Peran:* Bertugas membuat grafik. Memiliki keahlian untuk meracik *query*, memilih jenis visualisasi (Pie, Bar, Line), dan menentukan *role* mana yang berhak melihat grafik tersebut. Pada MVP, role ini juga merangkap sebagai pengelola Role & User (lihat Bab 5.1).
3. **AI / Developer (System Contributor)**
   - *Peran:* Pihak yang membaca PRD ini untuk menulis, menguji, dan melakukan *deployment* kode menggunakan kombinasi Laravel, ReactJS, dan Docker.

## 4. User Stories
*(Format: Sebagai [User], saya mau [Fitur] supaya [Manfaat] | **AC = Acceptance Criteria / Syarat Lulus**)*

### Manajemen Role & User (Admin)
*   **Story:** Sebagai Admin, saya mau membuat, mengedit, dan menghapus *Role* (misal: CEO, Manager HR, Manager IT, Data Analis) supaya struktur akses bisa disesuaikan dengan struktur organisasi perusahaan.
    *   **AC:** Terdapat halaman CRUD Role. Role yang masih dipakai oleh user aktif tidak bisa dihapus (harus muncul warning/block).
*   **Story:** Sebagai Admin, saya mau membuat akun user baru dan menetapkan role-nya supaya karyawan bisa login sesuai jabatannya.
    *   **AC:** Form pembuatan user mewajibkan pemilihan 1 role dari daftar role yang ada. User baru menerima kredensial login (email + password, atau reset-password link).

### Pembuatan Grafik (Data Analis)
*   **Story:** Sebagai Data Analis, saya mau memasukkan sintaks SQL/Query kustom ke dalam sistem supaya saya bisa menarik data mentah untuk divisualisasikan.
    *   **AC:** Sistem menerima input *query*, mengeksekusinya ke database (mode read-only, dengan timeout & row limit — lihat Bab 5.2), dan menampilkan pratinjau tabel hasil *query* tanpa *error*.
*   **Story:** Sebagai Data Analis, saya mau memilih jenis grafik (Bar, Pie, dll) dari hasil *query* supaya data tampil lebih mudah dipahami.
    *   **AC:** Terdapat UI pemilih jenis grafik yang otomatis me-render visualisasi berdasarkan kolom *query* yang ditarik.

### Manajemen Role Grafik (Data Analis)
*   **Story:** Sebagai Data Analis, saya mau menetapkan grafik yang baru dibuat ke *role* tertentu (misal: "CEO") supaya kerahasiaan data lintas departemen terjaga.
    *   **AC:** Saat menyimpan grafik, wajib ada form pemilihan *role/permission* (multi-select). Grafik tersimpan di database dengan relasi ke *role ID* yang dipilih melalui tabel pivot `chart_role`.

### Konsumsi Data (End User / CEO / Manajer)
*   **Story:** Sebagai Manajer, saya mau login ke dashboard supaya saya bisa memantau metrik departemen saya.
    *   **AC:** Setelah berhasil login, pengguna dapat melihat daftar Dashboard yang relevan dengan hak akses (jabatan) mereka. Mereka dapat membuka dashboard dan melihat grafik-grafik yang telah disusun oleh Data Analis dengan tata letak (grid) yang rapi. Grafik milik role lain tidak boleh bocor/tampil.

### Manajemen Dashboard (Data Analis)
*   **Story:** Sebagai Data Analis, saya mau merakit dashboard secara kustom dan mengatur ukuran/posisi grafik (drag-and-drop) supaya tampilannya mudah dibaca oleh eksekutif.
    *   **AC:** Terdapat halaman Dashboard Editor berbasis Grid (menggunakan react-grid-layout) di mana Analis bisa memilih grafik dari "pool", menariknya ke dalam kanvas, mengatur lebarnya, lalu menyimpan layout (posisi & ukuran) ke database.

### Iframe Embedding (Eksternal / Integrasi)
*   **Story:** Sebagai Data Analis, saya mau men-generate token embed untuk sebuah *Dashboard* supaya dashboard tersebut bisa dipasang di website eksternal tanpa harus login.
    *   **AC:** Terdapat tombol "Generate Token" pada halaman Dashboard Editor. Saat diklik, sistem membuat `embed_token` unik (random string, minimal 32 karakter) dan menampilkan tag siap-copy: `<iframe src="[API_URL]/embed/dashboard/{embed_token}"></iframe>`.
*   **Story:** Sebagai Data Analis, saya mau bisa mencabut/mengganti token embed yang sudah pernah dibagikan supaya kalau token bocor, akses lama langsung mati.
    *   **AC:** Terdapat tombol "Regenerate Token". Token lama otomatis invalid begitu token baru dibuat. Endpoint embed dengan token lama mengembalikan 404/410.

## 5. Functional Requirements
*(Fitur inti yang wajib ada dan dapat diuji)*

**5.1. Modul Autentikasi & Manajemen Role**
- Sistem harus memiliki fitur login multi-user.
- Sistem harus bisa membuat, mengedit, dan menghapus *Role* (Contoh: CEO, Manager HR, Manager IT, Data Analis).
- Sistem harus bisa mengelola daftar pengguna dan memasukkan mereka ke dalam *Role* tertentu.
- **[BARU] Profil & Keamanan (Sistem OTP):** Pengguna dapat mengelola profil mereka (Nama, Email). Fitur *Reset Password* dan *Ganti Kata Sandi* (di Pengaturan) dilindungi oleh sistem keamanan tinggi menggunakan **OTP (One-Time Password) 6-digit** yang dikirim via email HTML berdesain *Dark Mode*. OTP divalidasi menggunakan *Laravel Cache* dengan masa aktif 5 menit melalui UI 2-langkah interaktif untuk mencegah *session hijacking*.
- Pada MVP, hak untuk mengelola Role & User melekat pada akun dengan role "Data Analis"/Admin — belum ada role "Super Admin" terpisah.

**5.2. Modul Chart Builder (Hybrid Mode: GUI & SQL)**
- Sistem menyediakan 2 metode perakitan grafik untuk Data Analis:
  1. **GUI Builder (No-Code):** Mengadopsi standar Metabase, pengguna memilih Tabel, Sumbu X, Fungsi Agregasi, dan Sumbu Y melalui antarmuka visual. Sistem merakit SQL secara otomatis. Digunakan untuk *single-table query* cepat.
  2. **SQL Editor:** Editor teks klasik untuk mengeksekusi *raw query* kompleks (misalnya yang membutuhkan `JOIN` antar tabel).
- Sistem mengeksekusi *query* melalui koneksi terpisah (`DB_CONNECTION_READONLY`) dengan hak akses `SELECT`.
- **Query Timeout & Row Limit:** Eksekusi dibatasi *timeout* (default: 10 detik) dan UI *Data Preview* dibatasi maksimal 100 baris.
- **Strict Visual Analytics:** Sistem ini secara eksklusif hanya melayani tipe visualisasi (Bar, Pie, Line) tanpa mencampuradukkan dengan tipe "Log Tabel", guna menjaga *dashboard* eksekutif tetap bersih dan fokus pada ringkasan data.

**5.3. Modul Data Explorer (Data Analyst)**
- Sistem menyediakan halaman khusus bagi Data Analyst untuk melakukan *preview* (mengintip) isi mentah dari tabel-tabel di *database* tanpa perlu membuka aplikasi eksternal (*phpMyAdmin*/*DBeaver*).
- Fitur ini murni bersifat *Read-Only* dan **wajib dibatasi maksimal 100 baris** per klik tabel untuk mencegah memori server kelebihan beban (*crash*).
- Sistem **wajib memblokir** tabel-tabel internal (*migrations, personal_access_tokens, password_reset_tokens*, dll) dari pratinjau ini demi menjaga keamanan kredensial.
- Halaman ini hanya boleh diakses (dan menunya hanya muncul) bagi pengguna dengan *Role* Data Analyst.

**5.4. Modul Dashboard Manual & Layout Editor (Custom Dashboard)**
- Sistem harus memiliki form untuk membuat entitas **Dashboard** (Judul, Kreator).
- Halaman *Dashboard* berfungsi ganda: sebagai daftar list dashboard untuk end-user, dan sebagai **Workspace/Editor** bagi Data Analis.
- Data Analis dapat merakit satu dashboard berisi berbagai kombinasi grafik yang mereka buat melalui antarmuka *Drag & Drop* (menggunakan library `react-grid-layout`).
- Konfigurasi tata letak (X, Y, Lebar, Tinggi) dari masing-masing grafik disimpan di tabel pivot `dashboard_chart`.
- **[BARU] Caching:** Hasil eksekusi query untuk sebuah chart dapat di-cache selama durasi tertentu (rekomendasi default: 5 menit) untuk mengurangi beban database saat dashboard dibuka berulang kali. Cache di-invalidasi otomatis saat masa berlaku habis.

**5.5. Modul Embed / Iframe**
- Sistem harus dapat men-generate `embed_token` unik (random string) per *dashboard* untuk akses publik tanpa login.
- Endpoint publik embed (`GET /api/public/dashboards/{embed_token}`) mengembalikan data dashboard beserta seluruh grafik dan konfigurasinya tanpa memerlukan session/JWT — validasi otorisasi dilakukan murni berdasarkan kecocokan token dengan yang tersimpan di database.
- Sistem harus menyediakan kode snippet HTML berbentuk `<iframe src="..."></iframe>` yang siap disalin oleh pengguna dari halaman Dashboard Editor.
- Data Analis dapat me-regenerate token kapan saja; begitu token baru dibuat, token lama langsung tidak valid (di-overwrite, bukan disimpan sebagai histori).

**5.6. [BARU] Audit Log (opsional, lihat Bab 7 untuk status scope)**
- Sistem sebaiknya mencatat aktivitas penting: login user, pembuatan/pengeditan/penghapusan chart, perubahan role assignment pada chart, dan generate/regenerate embed token.
- Log minimal berisi: `user_id`, `action`, `target` (misal chart ID), `timestamp`.

## 6. Non-Functional Requirements
*(Kriteria kualitas, keamanan, dan performa)*

- **Security (Keamanan Database):** Eksekusi *query* kustom oleh Data Analis berpotensi memicu *SQL Injection* atau *resource exhaustion*. Sistem harus menggunakan koneksi database terpisah dengan hak akses *Read-Only* (hanya bisa `SELECT`), dilengkapi **query timeout** dan **row limit** (lihat Bab 5.2).
- **Security (API):** Semua endpoint API yang merender data grafik wajib dilindungi middleware otorisasi berbasis *Role*, kecuali endpoint `GET /api/embed/{embed_token}` yang divalidasi murni berdasarkan token.
- **Security (Embed Token):** Token embed wajib berupa random string dengan entropi cukup tinggi (minimal 32 karakter, generated menggunakan CSPRNG) agar tidak bisa ditebak/brute-force.
- **Performance:** Rendering grafik pada *dashboard* tidak boleh memblokir UI utama. Pengambilan data (*fetching*) harus dilakukan secara asinkron (*asynchronous*), dan didukung mekanisme caching (lihat Bab 5.4) untuk chart yang sering diakses.
- **Maintainability:** Seluruh *environment* (Database, Backend, Frontend) harus di-kontainerisasi menggunakan Docker agar konsisten antara tahap *development* dan *production*.
- **[BARU] Testability:** Logika RBAC (validasi role terhadap akses chart) wajib memiliki unit test tersendiri di Backend, mengingat kebocoran logika ini berdampak langsung pada kerahasiaan data lintas role. Minimal skenario yang wajib di-cover: user dengan role X tidak bisa mengakses chart yang hanya di-assign ke role Y.

## 7. Scope Project
**In Scope (Yang dikerjakan pada rilis awal / MVP):**
- Sistem Login dan Role-based Access Control (RBAC) dasar, termasuk CRUD Role & User oleh Admin/Data Analis.
- Custom Query Runner ke 1 database utama, dengan query timeout dan row limit pada preview.
- Chart Builder & Renderer menggunakan ReactJS + **ECharts** (8 tipe chart: Bar, Pie, Line, Area, Scatter, Radar, Gauge, Heatmap).
- Custom Dashboard Manual dengan fitur **Drag & Drop Layout Editor**.
- Caching sederhana untuk hasil query chart (default 5 menit).
- Iframe embed token generator (token statis + regenerate manual) untuk integrasi eksternal.
- Setup Docker (Dockerfile & docker-compose.yml).

**Out of Scope (Ditunda, untuk mencegah *scope creep*):**
- Koneksi ke berbagai jenis *Multiple Heterogeneous Databases* secara bersamaan (fokus 1 sumber database dulu).
- Fitur *Export* data ke PDF / Excel.
- Algoritma prediksi atau AI Data Analytics.
- Role "Super Admin" terpisah dari "Data Analis" untuk pengelolaan Role & User.
- Token embed dengan masa berlaku (expiry) otomatis — MVP hanya token statis dengan regenerate manual.
- Audit log komprehensif (bisa jadi *nice-to-have* bila waktu memungkinkan, bukan syarat wajib MVP).

## 8. Tech Stack
*(Teknologi yang disepakati berdasarkan arahan pembimbing)*

- **Backend / Core API:** Laravel (PHP). Menyediakan REST API, menangani RBAC, eksekusi query, dan logika bisnis.
- **Frontend / UI:** ReactJS. Digunakan sebagai Single Page Application (SPA) untuk interaktivitas tinggi.
- **Chart Library (React):** ECharts (Apache ECharts) melalui wrapper `echarts-for-react`. Dipilih karena sangat handal, interaktif, dan mendukung visualisasi yang sangat bervariasi.
- **Database:** MySQL / PostgreSQL (sebagai sumber data dan penyimpan state aplikasi).
- **Caching:** Laravel Cache (driver file/database untuk MVP; Redis dapat dipertimbangkan bila kebutuhan performa meningkat).
- **Infrastructure / Deployment:** Docker & Docker Compose, dengan **Caddy Server** sebagai *Reverse Proxy* untuk otomatisasi HTTPS (Let's Encrypt) dan *routing* API.

## 9. Struktur Folder
Proyek ini akan menggunakan arsitektur pemisahan *repository* secara logis namun disatukan dalam satu *root* (monorepo) untuk kemudahan kontainerisasi menggunakan Docker.

```text
dss-project/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/ # Endpoint logic
│   │   ├── Models/           # Database schema & relationships
│   │   └── Services/         # Logika query runner & chart processing
│   ├── routes/
│   │   └── api.php           # REST API routes
│   ├── tests/                # Unit & feature test (wajib cover RBAC)
│   └── database/             # Migrations & Seeders (RBAC)
├── frontend/                 # ReactJS App
│   ├── src/
│   │   ├── components/       # Reusable UI (ChartBuilder, Navbar)
│   │   ├── pages/            # Halaman utama (Dashboard, ChartEditor)
│   │   ├── services/         # Integrasi API (Axios calls)
│   │   └── utils/            # Helper fungsi
├── docker/                   # Konfigurasi Docker (Nginx, PHP, MySQL)
└── docker-compose.yml        # Orkestrasi container
```

## 10. Flow Data Antar Service
1. **Request Halaman/Grafik:** User login via ReactJS. ReactJS mengirim *token* autentikasi ke Laravel API.
2. **Validasi Role:** Laravel memvalidasi *token* dan *Role* user.
3. **Fetching Dashboard:** Laravel menyeleksi tabel `charts` dengan mencocokkan `role_id` user pada tabel *pivot* `chart_role` — seluruh chart yang cocok otomatis dikembalikan sebagai isi dashboard.
4. **Eksekusi Query (Dynamic):** Untuk setiap grafik yang diizinkan, Laravel mengecek cache terlebih dahulu; bila cache kosong/kedaluwarsa, Laravel menjalankan `raw_query` milik grafik tersebut pada database menggunakan mode *Read-Only* dengan timeout, lalu menyimpan hasilnya ke cache.
5. **Response & Render:** Laravel mengembalikan JSON berisi meta grafik (tipe, sumbu X/Y) dan array data. ReactJS menerimanya dan me-render komponen grafik (misal menggunakan Recharts).
6. **[BARU] Flow Embed:** Pihak eksternal memuat `<iframe src="[API_URL]/embed/dashboard/{embed_token}">`. Laravel mencocokkan token ke dashboard terkait (tanpa cek session), lalu mengembalikan data dashboard beserta *charts* dengan alur eksekusi/caching yang sama seperti poin 4.

## 11. Keputusan Teknis (Technical Decisions)
- **Mengapa memisah Backend (Laravel) dan Frontend (ReactJS)?** Agar API Laravel murni berfungsi sebagai penyedia data (JSON) dan *query runner*. ReactJS dipilih di *frontend* karena ekosistem *library* grafiknya sangat kaya, interaktif, dan optimal untuk me-render banyak grafik berat dalam satu *dashboard* tanpa *reload* halaman.
- **Sistem Autentikasi API (Token-Based):** Disepakati menggunakan **Laravel Sanctum** untuk men-*generate* Token API (*Bearer Token*) alih-alih menggunakan *Session/Cookie* konvensional. Ini membuat komunikasi antara port React (5173) dan Laravel (8000) lebih aman dan terstruktur.
- **Keamanan Lapis Ganda dengan OTP (One-Time Password):** Tidak menggunakan *reset link* standar bawaan framework, sistem ini mengimplementasikan OTP 6-digit untuk fitur "Lupa Sandi" maupun "Ganti Sandi" bagi pengguna yang sudah login. OTP disimpan di *Laravel Cache* (masa berlaku 5 menit). Hal ini terbukti jauh lebih kokoh terhadap celah *session hijacking* (pencurian *cookie*).
- **Notifikasi Antarmuka Pengguna (UI) & Global Dark Mode:** Seluruh aplikasi dibangun dengan pendekatan visual modern *Dark Mode* menggunakan variabel CSS murni yang responsif di Desktop maupun Mobile. Modul pemberitahuan menggunakan **SweetAlert2** dan **sweetalert2-react-content** untuk *alert* yang halus.
- **Peningkatan UX - Live Search & 2-Step Form:** Menambahkan *Live Search* pada Halaman Charts List (*Client-side filtering*) dan merombak formulir reset sandi menjadi 2-langkah dinamis (Input OTP -> Validasi -> Input Sandi Baru) secara asinkron (AJAX).
- **Development Environment:** Secara spesifik menggunakan **Laragon** (menggantikan XAMPP) untuk server database lokal MySQL guna menghindari *error/port collision* yang sering terjadi.
- **Inisialisasi Data (Seeder):** Otomatisasi pembuatan akun utama pertama kali menggunakan kredensial email spesifik mahasiswa (`mohsyaefuleffendi@student.uns.ac.id`) dengan *role* Data Analyst, agar pengujian aplikasi dapat langsung dilakukan pasca-migrasi.
- **Mengapa Docker?** Mengadopsi keunggulan Metabase. Dengan Docker, *environment* aplikasi terisolasi dengan rapi. Kontributor atau AI tidak perlu mengurus versi PHP atau Node.js lokal, cukup `docker-compose up`.
- **Database Query Runner terpisah:** Untuk keamanan, eksekusi *raw query* dari Data Analis akan diarahkan ke koneksi database (`DB_CONNECTION_READONLY`) yang user-nya hanya diberi *privilege* `SELECT`, dilengkapi timeout dan row limit untuk mencegah *resource exhaustion*.
- **Penyederhanaan Sistem (No Table Logs):** Diputuskan untuk mencabut fitur "Table Chart" atau "Data Logs" di *Dashboard*. Pengguna eksekutif hanya butuh melihat visualisasi akhir. Jika Data Analis butuh melihat data mentah, mereka dapat melihatnya di mode *Data Preview* saat di *Chart Builder*.
- **Metabase-Style GUI:** Pengembangan *GUI Builder* memanfaatkan fitur `Schema::getTables()` dan `Schema::getColumns()` dari sisi Laravel untuk memetakan struktur *database* ke *frontend* ReactJS secara dinamis, tanpa perlu migrasi *schema* tambahan.
- **Mengapa Dashboard otomatis, bukan custom?** Menyederhanakan MVP — Data Analis cukup fokus assign role per chart, tanpa perlu langkah tambahan menyusun tata letak dashboard. Ini juga meniru pola *permission-based visibility* yang sering dipakai tool BI enterprise.
- **Mengapa Iframe pakai token statis (bukan expiry otomatis) di MVP?** Menyederhanakan implementasi awal sambil tetap aman — token acak sulit ditebak, dan mekanisme regenerate manual sudah cukup untuk mitigasi risiko kebocoran pada tahap MVP. Expiry otomatis/berbasis waktu dapat ditambahkan di iterasi berikutnya.
- **[UPDATE] Automatic HTTPS & Reverse Proxy:** Menggunakan **Caddy Server** dalam arsitektur Docker untuk mengelola sertifikat SSL secara otomatis dan meneruskan lalu lintas `/api/*` ke *backend* Laravel. Ini menyederhanakan akses (semua lewat port 443 HTTPS) dan mengatasi masalah *Mixed Content* serta *CORS* di lingkungan produksi.

## 12. Struktur Database
Database Relasional (MySQL/PostgreSQL) difokuskan pada manajemen aplikasi dan RBAC.

- **`roles`**: `id`, `name` (Contoh: CEO, Manager, Analis)
- **`users`**: `id`, `name`, `email`, `password`, `role_id` (Foreign Key)
- **`charts`**:
  - `id`, `title`, `description`
  - `raw_query` (Text - menyimpan sintaks SQL)
  - `chart_type` (Enum: bar, pie, line, area, scatter, radar, gauge, heatmap)
  - `config` (JSON - menyimpan setting sumbu X/Y, warna)
  - `creator_id` (Foreign Key ke `users`)
  - `cache_ttl_seconds` (Integer, default 300 — durasi cache hasil query)
- **`chart_role` (Pivot Table)**: `chart_id`, `role_id` (Menentukan *role* mana saja yang bisa melihat grafik ini).
- **`dashboards`**: `id`, `title`, `creator_id`, `embed_token`, `created_at`, `updated_at`.
- **`dashboard_chart` (Pivot Table)**: `dashboard_id`, `chart_id`, `layout_config` (JSON untuk menyimpan posisi Grid/Grid Layout).
- **`activity_logs`** *(opsional, lihat Bab 7)*: `id`, `user_id`, `action`, `target_type`, `target_id`, `created_at`.

## 13. Coding Convention
- **Backend (Laravel):**
  - Mengikuti standar PSR-12.
  - Wajib memisahkan logika bisnis dari *Controller* ke *Service Layer*.
  - *Response* API wajib menggunakan *API Resources* agar format JSON seragam.
  - Logika RBAC wajib memiliki unit/feature test (lihat Bab 6 — Testability).
- **Frontend (ReactJS):**
  - Menggunakan *Functional Components* dan *Hooks*.
  - Penamaan file komponen menggunakan *PascalCase* (`ChartBuilder.jsx`), sedangkan fungsi/variabel menggunakan *camelCase*.
  - Pemanggilan API dilakukan di dalam folder `/services` untuk kemudahan *maintenance*.

## 14. Batasan untuk AI / Kontributor Lain
*(Aturan khusus untuk Vibe Coding dengan Antigravity / AI agent lainnya)*
1. **Fokus pada MVP:** Jangan menambahkan fitur di luar **Scope Project (Bab 7)** tanpa persetujuan eksplisit — termasuk jangan membangun dashboard custom/manual atau token embed dengan expiry otomatis kecuali diminta.
2. **Security First:** Saat meng-generate kode untuk mengeksekusi *raw query*, JANGAN PERNAH menyatukannya dengan koneksi database utama aplikasi (gunakan koneksi *read-only* terpisah, timeout, dan row limit).
3. **No Hallucination on Roles:** Setiap endpoint API yang mengembalikan grafik wajib disisipkan logika pengecekan *role* (kecuali endpoint `/embed/{token}` yang divalidasi via token). Jangan *bypass* logika RBAC.
4. **Standar Kode:** Baca Bab 13 sebelum men-generate komponen React atau kelas Laravel. Gunakan struktur folder yang disepakati di Bab 9.
5. **Testing:** Setiap perubahan pada logika RBAC atau query runner wajib disertai test case baru/diperbarui di folder `backend/tests/`.
