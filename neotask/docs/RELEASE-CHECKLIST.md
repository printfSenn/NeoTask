# Release Checklist

## Before handoff

- [ ] `npm install` dapat menyelesaikan dependency pada environment target.
- [ ] `npm run lint` lulus.
- [ ] `npm run build` lulus.
- [ ] `npm run build:single` lulus jika bundle tunggal dibutuhkan.
- [ ] `npm test` lulus.
- [ ] Tidak ada error console saat aplikasi dibuka.
- [ ] Sample project dapat dimuat.
- [ ] Keenam scene tampil dan tombol aktif memiliki state yang benar.
- [ ] Selection tetap saat scene berpindah.
- [ ] Undo dan redo berfungsi setelah perubahan task.
- [ ] JSON export dapat di-import kembali.
- [ ] CSV export memiliki header yang benar.
- [ ] PNG snapshot dapat dibuat.
- [ ] localStorage bertahan setelah reload.
- [ ] Dokumentasi dan template QA ikut diserahkan.
- [ ] Backup JSON terakhir disimpan terpisah dari output build.

## Handoff contents

- `src/`
- `tests/`
- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `docs/`
- `qa/`
- `package.json`
- `package-lock.json`
- output `dist/` atau `dist-single/` sesuai kebutuhan distribusi
