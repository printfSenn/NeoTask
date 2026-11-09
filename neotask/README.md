# NeoTask Project Map

NeoTask adalah dashboard monitoring proyek dan task berbasis React yang dikembangkan sebagai versi yang lebih terstruktur dari `jev.html`. Setiap proyek divisualisasikan sebagai objek 3D point-cloud, sedangkan setiap task divisualisasikan sebagai band, container, tier, atau bentuk scene lain yang sesuai.

## Isi paket

- `src/` - source React, engine, renderer, dan style aplikasi.
- `src/engine/` - state, persistence, data metrics, world builder, renderer, dan runtime loop.
- `src/ui/` - komponen header, stage, sidebar, serta bridge antara React dan engine.
- `tests/reference/neotask.html` - runtime HTML referensi untuk parity testing.
- `tests/` - parity test, DOM test, factory test, dan city traffic test.
- `docs/USER-FLOW.md` - alur pengguna end-to-end.
- `docs/ARCHITECTURE.md` - arsitektur modul dan lifecycle aplikasi.
- `docs/DATA-MODEL.md` - kontrak data, metrik, dan persistence.
- `docs/OPERATIONS.md` - cara menjalankan, backup, import, export, dan recovery.
- `docs/QA-CHECKLIST.md` - checklist acceptance dan smoke test.
- `qa/TEST-RESULTS.md` - template pencatatan hasil pengujian.

## Cara menjalankan

Prasyarat: Node.js dan npm.

```text
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

Perintah build yang tersedia:

```text
npm run build
npm run build:single
npm run preview
```

`build:single` menghasilkan bundle satu file untuk distribusi yang lebih dekat dengan pola runtime `jev.html`. Aplikasi source menggunakan React dan Vite, sehingga tidak dijalankan dengan membuka `src/index.html` langsung dari `file://`.

## Quick start operasional

1. Jalankan aplikasi dengan `npm run dev`.
2. Gunakan `LOAD SAMPLE` untuk memuat tiga proyek contoh, atau pilih `+ PROJECT` untuk mulai dari data sendiri.
3. Tambahkan task dan due date pada kartu proyek.
4. Pilih layer `PROGRESS`, `URGENCY`, `OPEN LOAD`, atau `RISK` untuk membaca kondisi proyek.
5. Pindah scene untuk melihat dataset yang sama melalui enam adaptor visual.
6. Gunakan search, kalender deadline, dan event log untuk menemukan pekerjaan yang perlu ditangani.
7. Export JSON setelah perubahan penting.

## Prinsip kerja

- Data proyek dan task adalah sumber utama seluruh tampilan.
- Scene hanya mengubah layout dan dekorasi visual. Identitas project, task, serta slot per scene tetap dipertahankan.
- Metrik seperti progress, urgency, load, risk, dan alert dihitung ulang dari data saat runtime.
- Data proyek disimpan pada localStorage dengan key `jev.projects.v3` untuk kompatibilitas migrasi dari lineage `jev.html`.
- Export JSON adalah backup utama. Export CSV ditujukan untuk analisis spreadsheet.
- Bahasa antarmuka dapat diganti antara Indonesia dan Inggris.

## Batasan paket

Dokumentasi ini mendeskripsikan source React dan runtime hasil build. File Markdown tidak mengubah perilaku aplikasi. `tests/reference/neotask.html` dipakai sebagai referensi parity, sedangkan source aktif berada di `src/`.
