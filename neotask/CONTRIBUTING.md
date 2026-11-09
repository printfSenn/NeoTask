# Contribution Guide

## Prinsip utama

NeoTask terdiri dari source React, engine visual, dan test parity terhadap `tests/reference/neotask.html`. Perubahan runtime harus disertai verifikasi yang sesuai agar perilaku data dan tampilan tetap konsisten.

## Sebelum mengubah runtime

1. Jalankan `npm test` untuk mengetahui baseline.
2. Jika perubahan menyentuh persistence atau data, simpan export JSON dari aplikasi.
3. Perbarui `CHANGELOG.md` bila perubahan terlihat oleh pengguna atau memengaruhi handoff.
4. Jalankan `npm run lint` dan build yang relevan.
5. Jika perubahan menyentuh interaksi, jalankan `npm run test:dom` dan checklist pada `docs/QA-CHECKLIST.md`.

## Area kerja

- `src/engine/` - state, data contract, layout, renderer, dan runtime.
- `src/ui/` - komponen React dan event bridge.
- `tests/` - regression dan parity test.
- `docs/` - dokumentasi produk dan teknis.
- `qa/` - hasil pengujian dan bukti manual.

## Aturan perubahan

- Pertahankan key localStorage `jev.projects.v3` kecuali migrasi dirancang dan diuji secara eksplisit.
- Jangan menyimpan derived metrics sebagai fakta permanen di payload project.
- Pastikan scene baru tidak mengubah identitas project atau task.
- Validasi tanggal melalui contract yang sama dengan engine sebelum menambah perilaku baru.
- Pertahankan dukungan import array langsung dan object `{ "projects": [...] }`.
- Hindari em dash pada dokumentasi project.

## Perintah verifikasi

```text
npm run lint
npm run build
npm test
```

## Format commit yang disarankan

```text
feat: add scene adapter
fix: preserve imported slots
docs: update operations guide
qa: record parity result
```
