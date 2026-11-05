# Context Frontend — Sistem Penilaian Siswa
> Dokumen ini adalah panduan lengkap untuk membangun backend berdasarkan seluruh halaman frontend yang ada.  
> Stack frontend: **Next.js 14 (App Router) + TypeScript + TailwindCSS + Prisma**

---

## 1. STRUKTUR HALAMAN FRONTEND

```
app/
├── admin/
│   ├── dashboard/          → Dashboard utama admin
│   ├── manajemen-user/     → Kelola user (admin, guru, siswa)
│   └── mata-pelajaran/     → Kelola mapel, soal, ujian, nilai
├── guru/
│   ├── dashboard/          → Dashboard guru
│   └── mata-pelajaran/     → Kelola mapel milik guru sendiri
├── profil/                 → Halaman profil (shared: admin & guru)
└── siswa/
    ├── akses-ujian/        → Form login siswa untuk masuk ujian
    ├── instruksi-ujian/    → Halaman instruksi sebelum ujian
    ├── ujian/              → Halaman pengerjaan soal ujian
    └── selsai-ujian/       → Halaman selesai / hasil ujian
```

---

## 2. ROLES & AKSES

| Role    | Keterangan                                           |
|---------|------------------------------------------------------|
| `ADMIN` | Super admin, kelola semua user dan data              |
| `GURU`  | Kelola mapel, soal, ujian, dan nilai siswa miliknya  |
| `SISWA` | Hanya mengakses ujian via token (tanpa akun login)   |

> Catatan: **Siswa tidak memiliki akun login**. Mereka masuk ujian menggunakan **NISN + Nama + Kelas + Token Ujian**.

---

## 3. DATABASE SCHEMA (Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // untuk sementara pake database mysql saja dlu
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// AUTH & USER
// ─────────────────────────────────────────────

enum Role {
  ADMIN
  GURU
}

model User {
  id          String    @id @default(cuid())
  name        String
  email       String    @unique
  password    String    // hashed bcrypt
  role        Role      @default(GURU)
  nip         String?   // NIP untuk guru, null untuk admin
  namaSekolah String?
  isActive    Boolean   @default(true)
  avatarUrl   String?
  lastLoginAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  mataPelajaran MataPelajaran[]
  soal          Soal[]
  ujian         Ujian[]
  konfigNilai   KonfigNilai[]

  @@map("users")
}

// ─────────────────────────────────────────────
// MATA PELAJARAN
// ─────────────────────────────────────────────

model MataPelajaran {
  id        Int      @id @default(autoincrement())
  nama      String
  kelas     String   // contoh: "XII IPA 1", "XI IPA 2"
  deskripsi String?
  warna     String   @default("zinc") // zinc | blue | violet | emerald | amber | red | cyan | pink
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relasi ke user (guru/admin pemilik)
  userId    String
  user      User   @relation(fields: [userId], references: [id])

  // Relations
  soal          Soal[]
  ujian         Ujian[]
  konfigNilai   KonfigNilai?

  @@map("mata_pelajaran")
}

// ─────────────────────────────────────────────
// BANK SOAL
// ─────────────────────────────────────────────

enum TipeSoal {
  PILIHAN_GANDA
  ESSAY
}

model Soal {
  id            String    @id @default(cuid())
  pertanyaan    String    @db.Text
  tipe          TipeSoal  @default(PILIHAN_GANDA)
  topik         String?   // contoh: "Limit Fungsi", "Fungsi Kuadrat"
  gambarUrl     String?   // opsional: gambar soal
  opsiA         String?   // Pilihan Ganda: opsi A
  opsiB         String?   // Pilihan Ganda: opsi B
  opsiC         String?   // Pilihan Ganda: opsi C
  opsiD         String?   // Pilihan Ganda: opsi D
  jawabanBenar  String?   // "A" | "B" | "C" | "D" untuk PG, atau teks untuk essay
  pembahasan    String?   @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  mataPelajaranId Int
  mataPelajaran   MataPelajaran @relation(fields: [mataPelajaranId], references: [id])

  userId  String
  user    User   @relation(fields: [userId], references: [id])

  // Many-to-many ke ujian
  ujianSoal UjianSoal[]

  @@map("soal")
}

// ─────────────────────────────────────────────
// UJIAN (termasuk ulangan, latihan, kuis)
// ─────────────────────────────────────────────

enum TipeUjian {
  UJIAN       // UAS/UTS
  ULANGAN     // Ulangan Harian
  LATIHAN     // Latihan
  KUIS        // Kuis/Quiz
}

enum StatusUjian {
  DRAFT
  AKTIF
  BERLANGSUNG
  SELESAI
}

model Ujian {
  id          String      @id @default(cuid())
  nama        String      // contoh: "UAS Matematika Peminatan"
  tipe        TipeUjian   @default(UJIAN)
  status      StatusUjian @default(DRAFT)
  token       String      @unique // contoh: "MAT-7X2K-9PQR"
  durasi      Int         // dalam menit
  kelas       String      // contoh: "XII IPA 1"
  tanggalMulai  DateTime?
  tanggalSelesai DateTime?
  acakSoal    Boolean     @default(false)
  acakOpsi    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  mataPelajaranId Int
  mataPelajaran   MataPelajaran @relation(fields: [mataPelajaranId], references: [id])

  userId  String
  user    User   @relation(fields: [userId], references: [id])

  // Relations
  soalUjian    UjianSoal[]
  sesiSiswa    SesiSiswa[]

  @@map("ujian")
}

// Pivot table: soal dalam ujian (bisa set urutan)
model UjianSoal {
  id      Int    @id @default(autoincrement())
  urutan  Int    @default(0)

  ujianId String
  ujian   Ujian  @relation(fields: [ujianId], references: [id], onDelete: Cascade)

  soalId  String
  soal    Soal   @relation(fields: [soalId], references: [id])

  @@unique([ujianId, soalId])
  @@map("ujian_soal")
}

// ─────────────────────────────────────────────
// SESI UJIAN SISWA
// ─────────────────────────────────────────────

enum StatusSesi {
  BERLANGSUNG
  SELESAI
  TIMEOUT     // habis waktu otomatis
  DIHENTIKAN  // dihentikan karena pelanggaran
}

model SesiSiswa {
  id          String      @id @default(cuid())
  nisn        String      // 10 digit
  namaLengkap String
  kelas       String
  status      StatusSesi  @default(BERLANGSUNG)
  nilaiBenar  Int         @default(0)
  nilaiSalah  Int         @default(0)
  nilaiAkhir  Float       @default(0)
  jumlahPelanggaran Int   @default(0)
  mulaiAt     DateTime    @default(now())
  selesaiAt   DateTime?
  ipAddress   String?
  userAgent   String?

  ujianId     String
  ujian       Ujian  @relation(fields: [ujianId], references: [id])

  // Relations
  jawaban       JawabanSiswa[]
  pelanggaran   PelanggaranSiswa[]

  @@map("sesi_siswa")
}

// Jawaban per soal oleh siswa
model JawabanSiswa {
  id            Int      @id @default(autoincrement())
  jawabanDipilih String? // "A" | "B" | "C" | "D" atau teks essay
  isBenar        Boolean @default(false)
  isRagu         Boolean @default(false) // flag ragu-ragu
  waktuDijawab   DateTime @default(now())

  sesiId  String
  sesi    SesiSiswa @relation(fields: [sesiId], references: [id], onDelete: Cascade)

  soalId  String
  // tidak ada relasi langsung ke Soal agar jawaban tetap tersimpan walau soal dihapus
  // simpan snapshot pertanyaan jika perlu

  @@unique([sesiId, soalId])
  @@map("jawaban_siswa")
}

// Log pelanggaran selama ujian
model PelanggaranSiswa {
  id        Int      @id @default(autoincrement())
  jenis     String   // "BUKA_TAB_LAIN" | "COPY_PASTE" | "KELUAR_FULLSCREEN" | "SCREENSHOT"
  catatan   String?
  waktu     DateTime @default(now())

  sesiId    String
  sesi      SesiSiswa @relation(fields: [sesiId], references: [id], onDelete: Cascade)

  @@map("pelanggaran_siswa")
}

// ─────────────────────────────────────────────
// KONFIGURASI NILAI AKHIR
// ─────────────────────────────────────────────

model KonfigNilai {
  id            Int   @id @default(autoincrement())
  bobotUjian    Int   @default(40)   // persen
  bobotUlangan  Int   @default(25)
  bobotLatihan  Int   @default(20)
  bobotKuis     Int   @default(15)
  kkm           Int   @default(70)

  mataPelajaranId Int  @unique
  mataPelajaran   MataPelajaran @relation(fields: [mataPelajaranId], references: [id])

  userId  String
  user    User   @relation(fields: [userId], references: [id])

  // Sub-bobot ujian (jika ada 2 ujian, masing-masing bisa diberi bobot)
  subBobotUjian Json? // contoh: [{"ujianId":"...", "bobot": 50}, ...]

  updatedAt DateTime @updatedAt

  @@map("konfig_nilai")
}
```

---

## 4. API ENDPOINTS

> **Base URL**: `http://localhost:3001/api`  
> **Auth**: JWT Bearer Token (kecuali endpoint siswa/akses-ujian)

---

### 4.1. AUTH

#### `POST /api/auth/login`
Login admin/guru.

**Request Body:**
```json
{
  "email": "budi.santosa@smansatu.sch.id",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "cuid123",
    "name": "Budi Santosa",
    "email": "budi.santosa@smansatu.sch.id",
    "role": "GURU",
    "nip": "198703152010012005",
    "namaSekolah": "SMA Negeri 1 Jakarta",
    "isActive": true,
    "avatarUrl": null,
    "lastLoginAt": "2026-04-26T10:00:00Z",
    "createdAt": "2026-04-21T00:00:00Z"
  }
}
```

**Response 401:**
```json
{ "message": "Email atau password salah" }
```

---

#### `GET /api/auth/me`
Mendapatkan data user yang sedang login (dari JWT).

**Header:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": "cuid123",
  "name": "Budi Santosa",
  "email": "budi.santosa@smansatu.sch.id",
  "role": "GURU",
  "nip": "198703152010012005",
  "namaSekolah": "SMA Negeri 1 Jakarta",
  "isActive": true,
  "avatarUrl": null,
  "lastLoginAt": "2026-04-26T10:00:00Z",
  "createdAt": "2026-04-21T00:00:00Z"
}
```

---

### 4.2. ADMIN — DASHBOARD

#### `GET /api/admin/dashboard`
Statistik untuk dashboard admin.

**Response 200:**
```json
{
  "totalSoal": 142,
  "ujianAktif": 3,
  "totalGuru": 33,
  "rataRataNilai": 78.5,
  "ujianBerlangsung": [
    {
      "id": "ujian-001",
      "nama": "UAS Matematika Peminatan",
      "namaSekolah": "SMA Negeri 1 Jakarta",
      "namaGuru": "Budi Santosa",
      "kelas": "XII IPA 1",
      "peserta": "23/35",
      "status": "BERLANGSUNG"
    }
  ],
  "recentUsers": [
    {
      "id": "usr-001",
      "name": "Sari Rahayu",
      "email": "sari.rahayu@smandua.sch.id",
      "role": "GURU",
      "nip": "198703152010012005",
      "namaSekolah": "SMA Negeri 2 Bandung",
      "isActive": true,
      "createdAt": "2026-04-21T00:00:00Z"
    }
  ],
  "recentActivities": [
    {
      "type": "SOAL_DIBUAT",
      "description": "Soal baru 'Integral Substitusi' ditambahkan",
      "time": "2026-04-26T09:55:00Z"
    }
  ]
}
```

---

### 4.3. ADMIN — MANAJEMEN USER

#### `GET /api/admin/users`
Daftar semua user dengan filter & pagination.

**Query Params:**
| Param    | Tipe   | Keterangan                              |
|----------|--------|-----------------------------------------|
| `role`   | string | `admin` \| `guru` \| `siswa` \| (kosong = semua) |
| `search` | string | Cari berdasarkan nama atau email        |
| `page`   | number | Halaman (default: 1)                    |
| `limit`  | number | Item per halaman (default: 5)           |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Adi Nugroho",
      "email": "adi.n@guru.examhub.id",
      "role": "guru",
      "bidang": "XII IPA 1",
      "nip": "0051234001",
      "hp": "081234567890",
      "status": "aktif"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 5,
    "totalPages": 3
  },
  "stats": {
    "total": 12,
    "admin": 2,
    "guru": 4,
    "siswa": 6
  }
}
```

> **Catatan**: Field `role` di manajemen-user menggunakan lowercase (`admin`, `guru`, `siswa`). Di tabel `users` Prisma gunakan enum `ADMIN` | `GURU`, lalu map saat response.

---

#### `POST /api/admin/users`
Tambah user baru.

**Request Body:**
```json
{
  "nama": "Sari Rahayu",
  "email": "sari.rahayu@smandua.sch.id",
  "password": "password123",
  "role": "guru",
  "bidang": "XII IPA 1",
  "nip": "198703152010012005",
  "hp": "081234567890",
  "status": "aktif"
}
```

**Response 201:**
```json
{ "message": "User berhasil ditambahkan", "id": 13 }
```

---

#### `GET /api/admin/users/:id`
Detail satu user.

**Response 200:**
```json
{
  "id": 1,
  "nama": "Adi Nugroho",
  "email": "adi.n@guru.examhub.id",
  "role": "guru",
  "bidang": "XII IPA 1",
  "nip": "0051234001",
  "hp": "081234567890",
  "status": "aktif"
}
```

---

#### `PUT /api/admin/users/:id`
Edit user.

**Request Body:** (sama dengan POST, semua field opsional)
```json
{
  "nama": "Adi Nugroho Updated",
  "status": "nonaktif"
}
```

**Response 200:**
```json
{ "message": "User berhasil diperbarui" }
```

---

#### `DELETE /api/admin/users/:id`
Hapus user.

**Response 200:**
```json
{ "message": "User berhasil dihapus" }
```

---

### 4.4. ADMIN / GURU — MATA PELAJARAN

#### `GET /api/mata-pelajaran`
Daftar mata pelajaran milik user (guru) atau semua (admin).

**Query Params:**
| Param   | Tipe   | Keterangan              |
|---------|--------|-------------------------|
| `kelas` | string | Filter berdasarkan kelas|

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Matematika Peminatan",
      "kelas": "XII IPA 1",
      "deskripsi": "Materi kalkulus, fungsi, dan limit",
      "warna": "zinc",
      "totalSoal": 48,
      "totalUjian": 2
    }
  ],
  "stats": {
    "totalSoal": 125,
    "totalUjian": 6
  }
}
```

---

#### `POST /api/mata-pelajaran`
Tambah mata pelajaran baru.

**Request Body:**
```json
{
  "nama": "Matematika Peminatan",
  "kelas": "XII IPA 1",
  "deskripsi": "Materi kalkulus, fungsi, dan limit",
  "warna": "zinc"
}
```

**Response 201:**
```json
{ "message": "Mata pelajaran berhasil ditambahkan", "id": 6 }
```

---

#### `PUT /api/mata-pelajaran/:id`
Edit mata pelajaran.

**Request Body:** (opsional semua field)
```json
{
  "nama": "Matematika Peminatan",
  "kelas": "XII IPA 1",
  "deskripsi": "Update deskripsi",
  "warna": "blue"
}
```

---

#### `DELETE /api/mata-pelajaran/:id`
Hapus mata pelajaran.

---

### 4.5. SOAL (Bank Soal)

#### `GET /api/mata-pelajaran/:mapelId/soal`
Daftar soal dalam satu mapel.

**Query Params:**
| Param    | Tipe   | Keterangan                          |
|----------|--------|-------------------------------------|
| `search` | string | Cari berdasarkan pertanyaan         |
| `tipe`   | string | `PILIHAN_GANDA` \| `ESSAY`          |

**Response 200:**
```json
{
  "data": [
    {
      "id": "soal-001",
      "pertanyaan": "Tentukan nilai lim x→2 (x²+3x−5)",
      "tipe": "PILIHAN_GANDA",
      "topik": "Limit Fungsi",
      "opsiA": "5",
      "opsiB": "7",
      "opsiC": "9",
      "opsiD": "11",
      "jawabanBenar": "C",
      "gambarUrl": null
    }
  ],
  "total": 48
}
```

---

#### `POST /api/mata-pelajaran/:mapelId/soal`
Tambah soal baru.

**Request Body:**
```json
{
  "pertanyaan": "Tentukan nilai lim x→2 (x²+3x−5)",
  "tipe": "PILIHAN_GANDA",
  "topik": "Limit Fungsi",
  "opsiA": "5",
  "opsiB": "7",
  "opsiC": "9",
  "opsiD": "11",
  "jawabanBenar": "C",
  "pembahasan": "Substitusi langsung x=2: 4+6-5=5",
  "gambarUrl": null
}
```

**Response 201:**
```json
{ "message": "Soal berhasil ditambahkan", "id": "soal-xyz" }
```

---

#### `PUT /api/soal/:soalId`
Edit soal.

---

#### `DELETE /api/soal/:soalId`
Hapus soal.

---

### 4.6. UJIAN

#### `GET /api/mata-pelajaran/:mapelId/ujian`
Daftar ujian dalam satu mapel.

**Query Params:**
| Param    | Tipe   | Keterangan                                         |
|----------|--------|----------------------------------------------------|
| `tipe`   | string | `UJIAN` \| `ULANGAN` \| `LATIHAN` \| `KUIS`       |
| `status` | string | `DRAFT` \| `AKTIF` \| `BERLANGSUNG` \| `SELESAI`  |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uas-mat-peminatan-2026",
      "nama": "UAS Matematika Peminatan",
      "tipe": "UJIAN",
      "status": "BERLANGSUNG",
      "token": "MAT-7X2K-9PQR",
      "durasi": 90,
      "kelas": "XII IPA 1",
      "tanggalMulai": "2026-04-22T08:00:00Z",
      "totalSoal": 45,
      "peserta": "23/35",
      "linkAkses": "http://localhost:3001/siswa/akses-ujian/uas-mat-peminatan-2026"
    }
  ]
}
```

---

#### `POST /api/mata-pelajaran/:mapelId/ujian`
Buat ujian baru.

**Request Body:**
```json
{
  "nama": "UAS Matematika Peminatan",
  "tipe": "UJIAN",
  "durasi": 90,
  "kelas": "XII IPA 1",
  "tanggalMulai": "2026-04-22T08:00:00Z",
  "tanggalSelesai": "2026-04-22T09:30:00Z",
  "acakSoal": false,
  "acakOpsi": false,
  "soalIds": ["soal-001", "soal-002", "soal-003"]
}
```

**Response 201:**
```json
{
  "message": "Ujian berhasil dibuat",
  "id": "uas-mat-peminatan-2026",
  "token": "MAT-7X2K-9PQR"
}
```
> **Token** di-generate otomatis di backend dengan format `[3 huruf mapel]-[4 char random]-[4 char random]`.

---

#### `PUT /api/ujian/:ujianId`
Edit ujian (hanya jika masih DRAFT).

---

#### `PATCH /api/ujian/:ujianId/status`
Ubah status ujian.

**Request Body:**
```json
{ "status": "AKTIF" }
```

---

#### `GET /api/ujian/:ujianId`
Detail ujian termasuk soal dan info peserta.

**Response 200:**
```json
{
  "id": "uas-mat-peminatan-2026",
  "nama": "UAS Matematika Peminatan",
  "tipe": "UJIAN",
  "status": "BERLANGSUNG",
  "token": "MAT-7X2K-9PQR",
  "durasi": 90,
  "kelas": "XII IPA 1",
  "totalSoal": 45,
  "peserta": {
    "masuk": 23,
    "total": 35
  },
  "linkAkses": "http://localhost:3001/siswa/akses-ujian/uas-mat-peminatan-2026",
  "soal": [
    {
      "id": "soal-001",
      "urutan": 1,
      "pertanyaan": "...",
      "tipe": "PILIHAN_GANDA",
      "opsiA": "...",
      "opsiB": "...",
      "opsiC": "...",
      "opsiD": "..."
    }
  ]
}
```

---

### 4.7. LAPORAN UJIAN

#### `GET /api/ujian/:ujianId/laporan`
Laporan hasil ujian (semua siswa yang sudah mengerjakan).

**Query Params:**
| Param   | Tipe   | Keterangan                    |
|---------|--------|-------------------------------|
| `filter`| string | `all` \| `lulus` \| `gagal` \| `viol` |
| `sort`  | string | `nilai` \| `nama` \| `benar` \| `salah` \| `pelanggaran` |
| `dir`   | string | `asc` \| `desc`               |

**Response 200:**
```json
{
  "ujian": {
    "id": "uas-mat-peminatan-2026",
    "nama": "UAS Matematika Peminatan",
    "tanggal": "22 Apr 2026",
    "durasi": "90 menit",
    "totalSoal": 45,
    "kelas": "XII IPA 1"
  },
  "summary": {
    "rataRata": 75.4,
    "tertinggi": 98,
    "terendah": 42,
    "lulus": 28,
    "gagal": 7,
    "totalSiswa": 35
  },
  "siswa": [
    {
      "nisn": "0051234001",
      "nama": "Adi Nugroho",
      "kelas": "XII IPA 1",
      "benar": 38,
      "salah": 7,
      "nilai": 84,
      "lulus": true,
      "pelanggaran": 0,
      "catatan": []
    },
    {
      "nisn": "0051234002",
      "nama": "Bella Rahmawati",
      "kelas": "XII IPA 1",
      "benar": 20,
      "salah": 25,
      "nilai": 44,
      "lulus": false,
      "pelanggaran": 3,
      "catatan": ["Buka tab lain 1x", "Copy-paste terdeteksi 1x", "Keluar fullscreen 1x"]
    }
  ]
}
```

---

#### `GET /api/ujian/:ujianId/laporan/siswa/:nisn`
Detail laporan per siswa (jawaban per soal).

**Response 200:**
```json
{
  "siswa": {
    "nisn": "0051234001",
    "nama": "Adi Nugroho",
    "kelas": "XII IPA 1",
    "nilai": 84,
    "benar": 38,
    "salah": 7,
    "lulus": true,
    "pelanggaran": 0
  },
  "jawaban": [
    {
      "nomorSoal": 1,
      "pertanyaan": "Tentukan nilai lim x→2 (x²+3x−5)",
      "jawabanSiswa": "C",
      "jawabanBenar": "C",
      "isBenar": true,
      "isRagu": false
    }
  ]
}
```

---

### 4.8. KONFIGURASI NILAI AKHIR

#### `GET /api/mata-pelajaran/:mapelId/konfig-nilai`
Ambil konfigurasi nilai akhir mapel.

**Response 200:**
```json
{
  "id": 1,
  "bobotUjian": 40,
  "bobotUlangan": 25,
  "bobotLatihan": 20,
  "bobotKuis": 15,
  "kkm": 70,
  "subBobotUjian": [
    { "ujianId": "uas-mat-peminatan-2026", "nama": "UAS Matematika Peminatan", "bobot": 50 },
    { "ujianId": "uts-fungsi-komposisi-2026", "nama": "UTS Fungsi Komposisi", "bobot": 50 }
  ]
}
```

---

#### `PUT /api/mata-pelajaran/:mapelId/konfig-nilai`
Simpan konfigurasi nilai akhir.

**Request Body:**
```json
{
  "bobotUjian": 40,
  "bobotUlangan": 25,
  "bobotLatihan": 20,
  "bobotKuis": 15,
  "kkm": 70,
  "subBobotUjian": [
    { "ujianId": "uas-mat-peminatan-2026", "bobot": 50 },
    { "ujianId": "uts-fungsi-komposisi-2026", "bobot": 50 }
  ]
}
```

> **Validasi:** `bobotUjian + bobotUlangan + bobotLatihan + bobotKuis` harus **= 100**.

---

#### `GET /api/mata-pelajaran/:mapelId/nilai-akhir`
Hitung dan ambil nilai akhir semua siswa di satu mapel.

**Response 200:**
```json
{
  "siswa": [
    {
      "nisn": "0051234001",
      "nama": "Adi Nugroho",
      "kelas": "XII IPA 1",
      "nilaiUjian": 84,
      "nilaiUlangan": 78,
      "nilaiLatihan": 90,
      "nilaiKuis": 85,
      "nilaiAkhir": 83,
      "lulus": true,
      "grade": "B"
    }
  ]
}
```

---

### 4.9. SISWA — AKSES UJIAN (No Auth)

#### `GET /api/siswa/ujian/:ujianId`
Info ujian untuk halaman login siswa (display only, tidak perlu auth).

**Response 200:**
```json
{
  "id": "uas-mat-peminatan-2026",
  "nama": "Ujian Akhir Semester Genap — Matematika Peminatan",
  "kelas": "X IPA",
  "durasi": 90,
  "status": "AKTIF",
  "namaSekolah": "SMA Negeri 1 Pekanbaru"
}
```

**Response 404:** Ujian tidak ditemukan atau tidak aktif.

---

#### `POST /api/siswa/akses-ujian`
Validasi identitas siswa + token, buat sesi ujian.

**Request Body:**
```json
{
  "nisn": "0051234001",
  "namaLengkap": "Adi Nugroho",
  "kelas": "XIPA1",
  "token": "MAT-7X2K-9PQR"
}
```

**Response 200:**
```json
{
  "sesiId": "sesi-abc123",
  "ujianId": "uas-mat-peminatan-2026",
  "namaUjian": "UAS Matematika Peminatan",
  "durasi": 90,
  "totalSoal": 45,
  "mulaiAt": "2026-04-22T08:05:00Z"
}
```

**Response 400/401:**
```json
{ "message": "Token tidak valid atau ujian tidak aktif" }
```

---

#### `GET /api/siswa/sesi/:sesiId/soal`
Ambil daftar soal untuk dikerjakan (tanpa kunci jawaban!).

**Response 200:**
```json
{
  "soal": [
    {
      "id": "soal-001",
      "nomorUrut": 1,
      "pertanyaan": "Diketahui fungsi f(x) = 2x² + 3x − 5. Tentukan nilai f(3).",
      "tipe": "PILIHAN_GANDA",
      "topik": "Fungsi Kuadrat",
      "gambarUrl": null,
      "opsiA": "22",
      "opsiB": "18",
      "opsiC": "16",
      "opsiD": "28"
    }
  ],
  "sisaWaktu": 5400
}
```

---

#### `POST /api/siswa/sesi/:sesiId/jawab`
Submit jawaban satu soal.

**Request Body:**
```json
{
  "soalId": "soal-001",
  "jawaban": "A",
  "isRagu": false
}
```

**Response 200:**
```json
{ "message": "Jawaban disimpan" }
```

---

#### `POST /api/siswa/sesi/:sesiId/pelanggaran`
Catat pelanggaran selama ujian.

**Request Body:**
```json
{
  "jenis": "BUKA_TAB_LAIN",
  "catatan": "Siswa membuka tab baru"
}
```

**Response 200:**
```json
{
  "jumlahPelanggaran": 2,
  "dihentikan": false
}
```

> Jika `jumlahPelanggaran >= 3` (atau sesuai config), set `dihentikan: true` dan hentikan sesi otomatis.

---

#### `POST /api/siswa/sesi/:sesiId/selesai`
Akhiri ujian (manual atau timeout).

**Request Body:**
```json
{
  "alasan": "SELESAI_MANUAL"
}
```

**Response 200:**
```json
{
  "nilaiBenar": 38,
  "nilaiSalah": 7,
  "nilaiAkhir": 84.4,
  "totalSoal": 45,
  "lulus": true,
  "kkm": 70
}
```

---

### 4.10. PROFIL USER

#### `GET /api/profil`
Ambil profil user yang login.

**Response 200:**
```json
{
  "id": "cuid123",
  "name": "Budi Santosa",
  "email": "budi.santosa@smansatu.sch.id",
  "role": "GURU",
  "nip": "198703152010012005",
  "namaSekolah": "SMA Negeri 1 Jakarta",
  "isActive": true,
  "avatarUrl": null,
  "lastLoginAt": "2026-04-26T10:00:00Z",
  "createdAt": "2026-04-21T00:00:00Z"
}
```

---

#### `PATCH /api/profil`
Update profil (nama, foto, password).

**Request Body:**
```json
{
  "name": "Budi Santosa Updated",
  "avatarUrl": "https://...",
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 5. DATA CONTOH (SEED DATA)

### Users (Admin & Guru)
```json
[
  { "name": "Budi Santosa",    "email": "budi.santosa@smansatu.sch.id",   "role": "GURU",  "nip": "198703152010012005", "namaSekolah": "SMA Negeri 1 Jakarta",    "isActive": true  },
  { "name": "Sari Indrawati",  "email": "sari.indrawati@smandua.sch.id",  "role": "GURU",  "nip": "199001202015011003", "namaSekolah": "SMA Negeri 2 Bandung",    "isActive": true  },
  { "name": "Andi Prasetyo",   "email": "andi.prasetyo@smantiga.sch.id",  "role": "GURU",  "nip": "198812052012012009", "namaSekolah": "SMA Negeri 3 Surabaya",   "isActive": true  },
  { "name": "Rizal Hakim",     "email": "rizal.hakim@admin.edu.id",       "role": "ADMIN", "nip": null,                "namaSekolah": "Dinas Pendidikan DKI",    "isActive": false },
  { "name": "Nurul Pratiwi",   "email": "nurul.p@smanempat.sch.id",       "role": "GURU",  "nip": "199205182018012002", "namaSekolah": "SMA Negeri 4 Medan",      "isActive": true  }
]
```

### Mata Pelajaran
```json
[
  { "nama": "Matematika Peminatan", "kelas": "XII IPA 1", "deskripsi": "Materi kalkulus, fungsi, dan limit",  "warna": "zinc"    },
  { "nama": "Matematika Wajib",     "kelas": "XI IPA 2",  "deskripsi": "Trigonometri dan fungsi komposisi",  "warna": "blue"    },
  { "nama": "Kimia",                "kelas": "XII IPS 1", "deskripsi": "Kimia organik dan reaksi dasar",     "warna": "emerald" },
  { "nama": "Fisika",               "kelas": "XI IPA 1",  "deskripsi": "Dinamika dan kinematika",            "warna": "violet"  },
  { "nama": "Biologi",              "kelas": "X IPA 1",   "deskripsi": "Sel dan jaringan tumbuhan",          "warna": "amber"   }
]
```

### Contoh Soal (Matematika Peminatan)
```json
[
  {
    "pertanyaan": "Tentukan nilai lim x→2 (x²+3x−5)",
    "tipe": "PILIHAN_GANDA",
    "topik": "Limit Fungsi",
    "opsiA": "5", "opsiB": "7", "opsiC": "9", "opsiD": "11",
    "jawabanBenar": "A",
    "pembahasan": "Substitusi langsung x=2: 4+6-5=5"
  },
  {
    "pertanyaan": "Diketahui fungsi f(x) = 2x² + 3x − 5. Tentukan nilai f(3).",
    "tipe": "PILIHAN_GANDA",
    "topik": "Fungsi Kuadrat",
    "opsiA": "22", "opsiB": "18", "opsiC": "16", "opsiD": "28",
    "jawabanBenar": "A",
    "pembahasan": "f(3) = 2(9) + 3(3) − 5 = 18 + 9 − 5 = 22"
  },
  {
    "pertanyaan": "Jelaskan konsep turunan dan aplikasinya dalam kehidupan sehari-hari.",
    "tipe": "ESSAY",
    "topik": "Turunan"
  },
  {
    "pertanyaan": "Hitung integral ∫(3x²+2x) dx",
    "tipe": "PILIHAN_GANDA",
    "topik": "Integral",
    "opsiA": "x³+x²+C", "opsiB": "3x³+2x²+C", "opsiC": "x³+x²", "opsiD": "6x+2+C",
    "jawabanBenar": "A"
  }
]
```

### Ujian
```json
[
  {
    "id": "uas-mat-peminatan-2026",
    "nama": "UAS Matematika Peminatan",
    "tipe": "UJIAN",
    "status": "BERLANGSUNG",
    "token": "MAT-7X2K-9PQR",
    "durasi": 90,
    "kelas": "XII IPA 1",
    "tanggalMulai": "2026-04-22T08:00:00Z"
  },
  {
    "id": "uts-fungsi-komposisi-2026",
    "nama": "UTS Fungsi Komposisi",
    "tipe": "UJIAN",
    "status": "SELESAI",
    "token": "MAT-4A1B-7CDE",
    "durasi": 60,
    "kelas": "XII IPA 1",
    "tanggalMulai": "2026-03-10T08:00:00Z"
  },
  {
    "id": "uh-trigonometri-2026",
    "nama": "UH Trigonometri",
    "tipe": "ULANGAN",
    "status": "AKTIF",
    "token": "MAT-3B5C-1FGH",
    "durasi": 45,
    "kelas": "XII IPA 1"
  }
]
```

### Siswa (Sesi Ujian)
```json
[
  { "nisn": "0051234001", "nama": "Adi Nugroho",     "kelas": "XII IPA 1" },
  { "nisn": "0051234002", "nama": "Bella Rahmawati", "kelas": "XII IPA 1" },
  { "nisn": "0051234003", "nama": "Candra Wijaya",   "kelas": "XII IPA 1" },
  { "nisn": "0051234004", "nama": "Dewi Anggraeni",  "kelas": "XII IPA 1" },
  { "nisn": "0051234005", "nama": "Eko Prasetyo",    "kelas": "XII IPA 1" },
  { "nisn": "0051234006", "nama": "Fitri Handayani", "kelas": "XII IPA 1" },
  { "nisn": "0051234007", "nama": "Gilang Ramadhan", "kelas": "XII IPA 1" },
  { "nisn": "0051234008", "nama": "Hana Safitri",    "kelas": "XII IPA 1" },
  { "nisn": "0051234009", "nama": "Ivan Santoso",    "kelas": "XII IPA 1" },
  { "nisn": "0051234010", "nama": "Julia Maharani",  "kelas": "XII IPA 1" }
]
```

---

## 6. BUSINESS RULES & VALIDASI

### Ujian
- Token dihasilkan otomatis saat ujian dibuat, format: `[3HURUFRANDOM]-[4CHAR]-[4CHAR]` (uppercase).
- Status flow: `DRAFT → AKTIF → BERLANGSUNG → SELESAI`
- Ujian hanya bisa diedit saat masih `DRAFT`.
- Saat status `AKTIF`, siswa sudah bisa masuk dengan token.
- Nilai siswa dihitung saat sesi diselesaikan.

### Sesi Siswa
- Satu siswa (NISN) hanya bisa punya 1 sesi aktif per ujian.
- Jika sudah ada sesi SELESAI, siswa tidak boleh masuk lagi ke ujian yang sama.
- Pelanggaran >= 3 kali → sesi otomatis dihentikan (`DIHENTIKAN`).
- Saat waktu habis → backend set status sesi ke `TIMEOUT` otomatis (gunakan cron/job atau cek saat `GET soal`).

### Konfigurasi Nilai Akhir
- Total bobot harus = 100%. Validasi di backend sebelum simpan.
- Grade: A (≥90), B (≥80), C (≥70), D (<70).
- KKM default = 70. Siswa lulus jika nilaiAkhir >= KKM.

### Manajemen User
- Email harus unik.
- Password harus di-hash dengan bcrypt sebelum disimpan.
- Admin tidak memiliki NIP.
- Guru memiliki NIP (18 digit).
- Siswa TIDAK memiliki akun di tabel `users`, mereka diidentifikasi via NISN saat ujian.

---

## 7. ENVIRONMENT & CONFIG

### `.env` Backend
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sistem_penilaian"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"


untuk sementera, database nya pake  mysql local saja dlu ya.

```

### `.env.local` Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 8. TECH STACK BACKEND (REKOMENDASI)

| Layer        | Teknologi                        |
|--------------|----------------------------------|
| Runtime      | Node.js                          |
| Framework    | Express.js atau NestJS           |
| ORM          | Prisma                           |
| Database     | PostgreSQL/ untuk sementara pake database mysql saja dlu                       |
| Auth         | JWT (jsonwebtoken) + bcrypt      |
| Validasi     | Zod atau Joi                     |
| Upload File  | Multer + local storage / S3      |

---

## 9. CATATAN KHUSUS

1. **Siswa tidak login** — mereka masuk ujian dengan `NISN + Nama + Kelas + Token`. Tidak ada JWT untuk siswa.
2. **Soal tidak boleh terekspos jawaban** — endpoint `GET /api/siswa/sesi/:sesiId/soal` **TIDAK** mengembalikan field `jawabanBenar` dan `pembahasan`.
3. **Anti-cheat detection** — frontend mengirim event pelanggaran ke backend tiap kali terdeteksi tab switch / copy-paste / keluar fullscreen. Backend menyimpan log ke tabel `pelanggaran_siswa`.
4. **Token ujian** — unik per ujian, digunakan siswa untuk masuk. Bisa di-revoke dengan mengganti token atau menonaktifkan ujian.
5. **Waktu sisa** — backend menyimpan `mulaiAt`. Frontend menghitung sisa waktu dari `mulaiAt + durasi - now`. Saat selesai, backend menghitung nilai otomatis dari jawaban yang tersimpan.
6. **Flag ragu-ragu** — disimpan di `jawaban_siswa.isRagu`. Digunakan untuk tampilan grid soal di sidebar ujian (warna amber).
7. **Laporan download** — frontend menampilkan tombol export; backend bisa menyediakan endpoint `GET /api/ujian/:id/laporan/export?format=xlsx` atau PDF.