# ✈️ Flight Booking System Setup Guide

Panduan singkat untuk menjalankan aplikasi pemesanan tiket pesawat.

---

Anggota Kelompok:
1. Athaya Naura Khalilah (23/512716/PA/21899)
2. Nasya Putri Raudhah (23/513931/PA/21967)
3. Muhammad Hanif Zuhair (23/516550/PA/22099)
4. Narrendra Setyawan Bahar (23/517555/PA/22195)

---

## Inisiasi

1. Buat folder baru untuk project:
   ```bash
   mkdir FlightBookingSystem
   cd FlightBookingSystem
   ```

2. Inisialisasi project dan install dependensi:
   ```bash
   npm init -y
   npm install bcrypt ejs open express express-session body-parser mysql2
   ```

3. Salin file dan folder berikut ke dalam folder project:
   - 📁 public
   - 📁 views
   - 📄 server.js

4. Buka file `server.js`, dan ubah konfigurasi user dan password database sesuai dengan lokalmu.

5. Import struktur database dan prosedur SQL:
   - Ini WAJIB dilakukan karena ada perubahan pada struktur dan logic database.

---

## Menjalankan Sistem

Jalankan server dengan perintah:
```bash
npm start server.js
```

Sistem akan berjalan di http://localhost:3000

---

## Akun Default

| Role   | Username     | Password |
|--------|--------------|----------|
| User   | test_user    | test     |
| Admin  | test_admin   | admin    |

Untuk membuat admin baru:
1. Daftar seperti biasa melalui halaman register.
2. Masuk ke database dan ubah kolom `role` pada user tersebut menjadi `admin`.

---

Selesai! Selamat mencoba 🚀
