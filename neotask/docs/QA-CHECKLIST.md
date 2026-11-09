# QA Checklist

## Automated checks

- [ ] `npm run lint` lulus.
- [ ] `npm run build` lulus.
- [ ] `npm run test:parity` lulus untuk engine dan data contract.
- [ ] `npm run test:factory` lulus untuk detail scene factory.
- [ ] `npm run test:cars` lulus untuk traffic city.
- [ ] `npm run test:dom` lulus untuk parity DOM dan interaksi.
- [ ] `npm test` lulus sebagai gabungan seluruh suite.

## Smoke test wajib

- [ ] Aplikasi terbuka melalui `npm run dev`.
- [ ] Tidak ada error JavaScript pada console saat load.
- [ ] Boot screen dapat dilewati dengan pointer atau tombol.
- [ ] Sample project muncul saat `LOAD SAMPLE` dipilih.
- [ ] `+ PROJECT` dan hotkey `N` membuat project baru.
- [ ] Project baru mendapat slot tanpa menghilangkan project lama.
- [ ] Task baru membentuk primitive visual sendiri.
- [ ] Checklist mengubah progress, warna, dan alert.
- [ ] Task overdue berubah menjadi status critical.
- [ ] Slider threshold mengubah alert count.
- [ ] Undo dan redo mengembalikan data.
- [ ] Keenam scene dapat dipilih.
- [ ] Selection tetap pada project yang sama saat scene berubah.
- [ ] Traffic dan cinema dapat diaktifkan dan dinonaktifkan.
- [ ] Histogram merespons layer dan selection.
- [ ] Deadline heatmap merespons tanggal dan group.
- [ ] Search menemukan nama dan group.
- [ ] Event log dapat memilih project terkait.
- [ ] Import JSON valid mengganti data setelah konfirmasi.
- [ ] Import JSON rusak tidak menghapus data lama.
- [ ] Export JSON dapat di-import kembali.
- [ ] Export CSV memiliki header dan baris task.
- [ ] Snapshot PNG dapat diunduh.
- [ ] Bahasa Indonesia dan Inggris dapat dipilih.

## Regression matrix

| Area | City | Satellite | Ship | Factory | Airport | Metro |
|---|---:|---:|---:|---:|---:|---:|
| Project terlihat | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Task punya primitive sendiri | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dekorasi scene valid | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Selection dan picker | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Morph dari scene lain | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Data edge cases

- [ ] 0 project.
- [ ] 1 project tanpa task.
- [ ] 1 project dengan 1 task.
- [ ] Banyak task dalam satu project.
- [ ] 40 project dan ratusan task.
- [ ] Dua project dengan nama sama.
- [ ] Nama atau group sangat panjang.
- [ ] Due date kosong.
- [ ] Due date overdue.
- [ ] Deadline project tanpa task.
- [ ] Semua task selesai.
- [ ] Tanggal invalid seperti `2026-02-31`.
- [ ] JSON array langsung.
- [ ] JSON wrapper `{ "projects": [...] }`.
- [ ] Slot lama tetap stabil setelah project baru ditambahkan.

## Acceptance criteria

Release dianggap siap jika lint, build, dan seluruh test otomatis lulus, tidak ada error console pada smoke test, data tetap konsisten setelah reload, dan setiap scene memperlihatkan dataset yang sama tanpa reshuffle selection.

## Known operational limitations

- Runtime visual bergantung pada browser yang mendukung canvas dan animation API.
- Bundle satu file tetap dihasilkan melalui build step dan bukan source yang dibuka langsung dari `file://`.
- Profiling FPS untuk dataset besar sebaiknya dilakukan pada laptop target sebelum demo produksi.
