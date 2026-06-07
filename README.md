# 📋 IT Request Dashboard — Resource Group

Aplikasi web **Next.js 14** untuk mengelola IT Request Form PT. Unggul Dinamika Utama.  
Dashboard admin lengkap dengan database SQLite, filter/search, print view, dan manajemen status.

---

## 🚀 Cara Setup & Jalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
```
Isi file `.env`:
```
DATABASE_URL="file:./prisma/dev.db"
```

### 3. Setup database
```bash
npm run db:push
```

### 4. (Opsional) Isi sample data
```bash
npm run db:seed
```

### 5. Jalankan aplikasi
```bash
npm run dev
```

Buka browser ke **http://localhost:3000**

---

## 🗂️ Struktur Halaman

| URL | Keterangan |
|-----|-----------|
| `/` | Redirect ke `/dashboard` |
| `/dashboard` | Overview stats + request terbaru |
| `/dashboard/requests` | Daftar semua request (search, filter, pagination) |
| `/dashboard/requests/[id]` | Detail request + admin panel |
| `/dashboard/requests/[id]/print` | Print view (tampilan identik form asli) |
| `/form` | Form submit request baru |
| `/form/success` | Konfirmasi setelah submit |

---

## ✨ Fitur

### 📊 Dashboard
- Statistik: Total, Pending, In Review, Approved, Rejected, Bulan Ini
- Tabel request terbaru dengan quick actions
- Distribusi status & quick navigation

### 📋 Manajemen Request
- Tabel dengan **search** (form number, nama, departemen)
- **Filter** by status dan prioritas
- **Pagination** (15 per halaman)
- Aksi: Lihat Detail, Cetak, Hapus

### 🔍 Detail Request
- Tampilan lengkap semua field form
- **Admin Panel** untuk update status/prioritas/assignee/catatan IT
- Tombol cetak langsung

### 🖨️ Print View
- Tampilan **identik** dengan form Excel asli
- Warna kuning untuk input fields, cyan untuk headers
- Semua checkbox, tanda tangan, layout kolom sama persis
- Auto-print saat halaman dibuka

### 📝 Form Submission
- Form lengkap dengan semua field
- Auto-generate form number
- Validasi input
- Redirect ke halaman sukses + option cetak

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **Prisma** — ORM
- **SQLite** — database (file lokal, tanpa setup server)
- **Lucide React** — icons

---

## 🗄️ Schema Database

Tabel `Request` menyimpan semua field form:
- Requester & Recipient Information
- System & Network checkboxes
- Hardware & Software checkboxes
- ERP fields
- Additional Description & Justification
- Signatures (7 kolom)
- Admin fields: `status`, `priority`, `itNotes`, `assignedTo`

**Status**: `pending` → `in_review` → `approved` / `rejected`  
**Priority**: `low` | `normal` | `high` | `urgent`

---

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Production server
npm run db:push      # Apply schema to database
npm run db:seed      # Isi sample data (5 records)
npm run db:studio    # Prisma Studio (GUI database)
```

---

## 🔒 Catatan

- Aplikasi ini **tanpa authentication** — tambahkan NextAuth.js untuk production
- Database SQLite disimpan di `prisma/dev.db` — backup file ini untuk data
- Untuk deploy ke server, pertimbangkan migrasi ke PostgreSQL/MySQL
