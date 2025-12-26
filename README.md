# 🔐 Password Manager

Password Manager adalah aplikasi web sumber terbuka yang dikembangkan menggunakan React.js dan Supabase. Proyek ini bertujuan menyediakan solusi penyimpanan kredensial yang aman dan terpusat dengan menggabungkan arsitektur Cloud Computing dan kriptografi modern. Keunggulan utamanya terletak pada penerapan **Client-Side Encryption** menggunakan algoritma AES, yang memastikan password diamankan (dienkripsi) langsung di browser pengguna sebelum dikirim ke database. Pendekatan ini menjamin privasi maksimal karena data yang tersimpan di server cloud bersifat acak dan tidak terbaca, sekaligus memudahkan pengguna mengakses data dari mana saja.

---

## 🚀 Fitur Utama

- 🔐 **User Authentication**: Secure Login and Sign Up managed by Supabase Auth.
- 🔒 **Client-Side Encryption**: Passwords are encrypted (AES) in the browser before being sent to the cloud.
- ☁️ **Cloud Storage**: Persistent data storage using Supabase PostgreSQL (Accessible anywhere).
- 📋 **Copy & Decrypt**: One-click feature to copy decrypted passwords to clipboard.
- 🗑️ **Vault Management**: Add and delete password entries easily.
- 🛡️ **Data Isolation**: Row Level Security (RLS) ensures users only see their own data.
- 🔄 **Forgot Password**: Secure email-based password reset functionality.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Deskripsi |
|-----------|------------|
| **React.js** | Library JavaScript untuk membangun antarmuka pengguna (UI) |
| **Supabase** | Platform Cloud Computing (PaaS) yang menyediakan layanan Autentikasi dan Database |
| **Node.js & npm** | Runtime environment dan manajer paket untuk menginstal library |
| **Vite** | Tool modern untuk inisialisasi project dan menjalankan server development |
| **crypto-js** | Library untuk melakukan enkripsi (AES) dan dekripsi password di sisi klien |
| **@supabase/supabase-js** | Modul klien resmi untuk menghubungkan aplikasi React dengan API Supabase |
---

## 📂 Struktur Folder
Berikut struktur folder utama dari proyek **Password Management System**:
```
password-management/
├─ node_modules/
├─ public/
├─ src/
│ ├─ assets/
│ ├─ utils/
| |  └─ crypto.js
│ ├─ App.css
│ ├─ App.jsx
│ └─ supabaseClient.js
|
└─ README.md
```

## ⚙️ Cara Menjalankan Proyek

#### 1. Clone Repository
```bash
git clone https://github.com/Fauzinih/Pass_Manager.git
cd Pass_Manager
```
#### 2. Install Dependency
```bash
npm install
```
#### 3. Konfigurasi Environment
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
#### 4. Jalankan Server Lokal
```bash
npm run dev
```
- Akses aplikasi di browser:
```bash
http://localhost:****
```


## ☁️ Konfigurasi Supabase
#### 1. Masuk ke https://supabase.com → buat proyek baru.
#### 2. Aktifkan Email Signup di `Authentication → Settings`.
#### 3. Buat tabel `vaults` di Table Editor dengan struktur berikut:

| Kolom        | Tipe   | Keterangan                      |
|---------------|--------|----------------------------------|
| `id` | bigint | Primary Key, Auto Increment |
| `user_id` | uuid | Foreign Key, Not Null |
| `app_name` | text | Not Null |
| `username` | text | Not Null |
| `encrypted_password` | text | Not Null |
| `created_at` | timestamp with time zone | Default |

#### 4. Ambil Project URL dan anon public key dari Supabase, lalu masukkan ke `supabaseClient.js`.

## 🔄 Alur Aplikasi
**1. Otentikasi (Login & Masuk Aplikasi)**
- Saat aplikasi dibuka, sistem mengecek apakah ada token login tersimpan di LocalStorage browser.
- User memasukkan Email dan Password.
- Aplikasi mengirim data ini ke Supabase Auth.
- Supabase memverifikasi data. Jika benar, Supabase mengirimkan Session Token kembali ke aplikasi.
- Aplikasi menerima token dan menampilkan halaman Dashboard. Sistem sekarang tahu siapa user yang sedang login (mendapat `user_id`). 

**2. Pengambilan Data (Menampilkan Daftar)**
- Permintaan Data: Dashboard melakukan request ke Supabase: "Tunjukkan semua data dari tabel vaults yang milik user ini."
- Cek Keamanan (RLS): Supabase mengecek kebijakan (Policy) RLS. "Apakah user ini punya hak melihat data ini?" -> Ya.
- Penerimaan Data: Supabase mengirim data berupa JSON (Nama App, Username, dan Password Terenkripsi).
- Tampilan: React menampilkan data tersebut di layar. Catatan: Password yang muncul di layar masih berupa kode acak atau hanya ditampilkan sebagian.

**3. Menyimpan Password Baru (Proses Enkripsi)**
- Input: User mengisi form (Nama Aplikasi, Username, dan Password Asli).
- SEBELUM dikirim ke server, JavaScript (Crypto-JS) mengambil Password Asli tersebut.
- Password dienkripsi menggunakan algoritma AES, hasilnya: Kode acak (Contoh: `U2FsdGVkX1+...`).
- Pengiriman: Aplikasi mengirim data ke Supabase:`{ App: 'FB', User: 'Budi', Pass: 'Kode Acak...' }`.
- Penyimpanan: Supabase menyimpan data (kode acak) tersebut ke tabel vaults.

**2. Menggunakan Password (Proses Dekripsi)**
- Aksi: User melihat list di Dashboard dan mengklik tombol `Copy` pada salah satu item.
- Ambil Data: Aplikasi mengambil kode acak (`U2FsdGVkX1+...`) dari database (atau dari list yang sudah ada).
- Sistem mengubah kode acak kembali menjadi Password Asli.
- Output: Password asli disalin otomatis ke Clipboard (tempat paste).
- Selesai: User tinggal melakukan Paste `Ctrl+V` di kolom password website tujuan (misal: Facebook).
