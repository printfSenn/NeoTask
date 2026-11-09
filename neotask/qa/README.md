# QA Directory

Folder ini menyimpan template dan catatan pengujian manual NeoTask. Checklist utama berada di [docs/QA-CHECKLIST.md](../docs/QA-CHECKLIST.md).

## Bukti test yang disarankan

- Output terminal dari `npm test`.
- Screenshot empty state dan project selected.
- Screenshot setiap scene utama.
- Export JSON sebelum dan sesudah test persistence.
- Catatan browser, OS, dan resolusi layar.
- Catatan error console jika ada.

## Workflow

1. Jalankan automated checks.
2. Isi smoke test dan edge case pada `docs/QA-CHECKLIST.md`.
3. Catat environment dan hasil pada `TEST-RESULTS.md`.
4. Simpan bukti manual dengan nama yang memuat area dan tanggal.
