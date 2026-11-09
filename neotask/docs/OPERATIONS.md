# Operations Guide

## Menjalankan aplikasi

### Development

```text
npm install
npm run dev
```

Gunakan URL lokal dari Vite untuk membuka aplikasi. Perubahan source akan dipantulkan melalui hot reload.

### Production build

```text
npm run build
npm run build:single
npm run preview
```

Gunakan `build` untuk bundle standar dan `build:single` untuk bundle satu file. Periksa output build sebelum handoff.

## Daily usage

### Membuat project

1. Klik `+ PROJECT` atau tekan `N`.
2. Isi nama project.
3. Isi group.
4. Isi deadline project bila ada.
5. Tambahkan task dari project card.

### Mengelola task

- Klik task untuk toggle selesai dan terbuka.
- Double-click task untuk edit judul dan due date.
- Klik `x` pada task untuk menghapusnya.
- Klik `ALL DONE` untuk menyelesaikan seluruh task project.

### Mengelola project

- `RENAME` mengubah nama.
- `GROUP` mengubah group.
- `DEADLINE` mengubah atau menghapus deadline.
- `HAPUS` menghapus project beserta task setelah konfirmasi.

## Navigation controls

| Input | Fungsi |
|---|---|
| Drag canvas | Orbit atau putar scene |
| Scroll canvas | Zoom |
| Click object | Pilih project |
| Arrow Left/Right | Pindah project |
| `/` | Fokus search |
| `Enter` di search | Pilih hasil pertama |
| `1` sampai `5` | Ganti layer |
| `Space` | Toggle auto orbit |
| `T` | Toggle traffic |
| `C` | Toggle cinema camera |
| `N` | Project baru |
| `R` | Reset view |
| `Escape` atau `Backspace` | Batalkan selection |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` atau `Ctrl+Y` | Redo |

## Backup dan recovery

### Backup rutin

1. Klik `EXPORT JSON` setelah perubahan penting.
2. Simpan file hasil export dengan tanggal, misalnya `neotask-backup-2026-11-09.json`.
3. Jangan menjadikan CSV sebagai satu-satunya backup karena JSON menyimpan seed dan slot per scene.

### Restore

1. Buka aplikasi.
2. Klik `IMPORT`.
3. Pilih JSON backup.
4. Konfirmasi replace jika aplikasi meminta konfirmasi.
5. Periksa project count, task count, scene, selection, dan deadline heatmap.

### Jika tampilan kosong atau data terlihat salah

1. Reload halaman.
2. Periksa console untuk error JavaScript.
3. Klik `LOAD SAMPLE` untuk membedakan masalah data dan masalah rendering.
4. Jika sample tampil, restore backup JSON.
5. Jika sample juga tidak tampil, jalankan `npm run test:dom`, simpan screenshot, dan catat browser serta resolusi layar.

## Export

### JSON

JSON adalah format backup utama dan memuat project, task, seed, slot, scene, layer, serta threshold.

### CSV

CSV ditujukan untuk spreadsheet dan berisi satu baris per task dengan kolom:

```text
project, group, project_deadline, task, task_due, done
```

Project tanpa task tetap diekspor sebagai satu baris project agar tidak hilang dari laporan.

### PNG

`SNAP PNG` mengunduh snapshot canvas yang sedang terlihat. Snapshot tidak menggantikan backup JSON.
