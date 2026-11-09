# Data Model

## Persistence contract

Key localStorage:

```text
jev.projects.v3
```

Bentuk payload yang disimpan:

```json
{
  "projects": [
    {
      "id": "p-example",
      "name": "Website Redesign",
      "group": "Work",
      "deadline": "2026-12-15",
      "seed": 123456,
      "slots": {
        "city": { "x": 1, "y": 1, "g": 3 },
        "satellite": { "x": 1, "y": 1, "g": 3 },
        "ship": { "x": 1, "y": 1, "g": 3 },
        "factory": { "x": 1, "y": 1, "g": 3 },
        "airport": { "x": 1, "y": 1, "g": 3 },
        "metro": { "x": 1, "y": 1, "g": 3 }
      },
      "tasks": [
        { "title": "Wireframe", "due": "2026-12-01", "done": true },
        { "title": "API integration", "due": "2026-12-12", "done": false }
      ]
    }
  ],
  "scene": "city",
  "layer": "true",
  "threshold": 0.7
}
```

## Field rules

- `id`: identifier stabil. Nama project tidak harus unik.
- `name`: nama yang tampil pada list, card, tooltip, dan event log.
- `group`: label grouping pada list dan deadline heatmap.
- `deadline`: format `YYYY-MM-DD` atau string kosong.
- `seed`: menentukan bentuk seeded agar project konsisten antar rebuild.
- `slots`: posisi project per scene. Slot yang sudah ada tidak boleh diacak ulang hanya karena project lain berubah.
- `tasks`: daftar task yang dimiliki project.
- `task.title`: judul task yang ditampilkan.
- `task.due`: format `YYYY-MM-DD` atau string kosong.
- `task.done`: status checklist.

## Normalization and import

Import menerima salah satu bentuk berikut:

- array project langsung;
- object `{ "projects": [...] }`.

Task dapat berupa string sederhana dan akan dinormalisasi menjadi task terbuka tanpa due date. Field tanggal yang tidak valid menjadi kosong. JSON rusak tidak boleh menimpa data yang sedang tersimpan.

## Derived metrics

Dengan `open = jumlah task belum selesai`, `done = jumlah task selesai`, dan `total = jumlah seluruh task`:

```text
next = due date task terbuka terdekat dan deadline project terdekat
       jika tidak ada tanggal, nilainya null

PROGRESS = done / total
           atau 0 jika project tidak memiliki task

URGENCY = clamp(1 - next / urgencyWindowDays, 0, 1)
           dengan urgencyWindowDays = 14

OPEN LOAD = open / open task maksimum antar project

RISK = clamp(URGENCY * (1 - 0.7 * PROGRESS)
             + (ada task overdue ? 0.15 : 0), 0, 1)

ALERT = URGENCY >= threshold dan project belum selesai
```

Project berstatus `DONE` jika memiliki minimal satu task dan semua task selesai. Deadline project tidak ikut menaikkan urgency jika seluruh task sudah selesai karena hanya task terbuka yang dipakai untuk menentukan tanggal berikutnya.

## Visual status task

| Kondisi | Visual default |
|---|---|
| Done | Putih terang steady |
| Open tanpa due date dekat | Hijau |
| Due dalam 2 hari | Kuning |
| Overdue | Merah |

Task diurutkan dengan task selesai lebih dahulu, kemudian due date terdekat, lalu urutan asli. Tujuannya agar progress terlihat sebagai struktur yang terisi dari bawah.
