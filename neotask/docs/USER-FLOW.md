# User Flow

Dokumen ini menjelaskan alur pengguna utama tanpa mengubah perilaku aplikasi.

```mermaid
flowchart TD
    A[Run NeoTask] --> B{Ada data tersimpan?}
    B -- Tidak --> C[Sample default atau project kosong]
    B -- Ya --> D[Load projects, scene, layer, threshold]
    C --> E[Explore dashboard]
    D --> E

    E --> F{Pilih object, list, atau search}
    F --> G[Selected Project Card]
    G --> H{Aksi data}
    H --> H1[Tambah, edit, atau hapus task]
    H --> H2[Rename, group, atau deadline]
    H --> H3[Checklist atau ALL DONE]
    H1 --> I[Recalculate metrics]
    H2 --> I
    H3 --> I
    I --> J[Rebuild geometry dan refresh React]
    J --> K[Persist ke localStorage]
    K --> E

    E --> L{Ganti scene atau layer}
    L --> M[Scene adapter atau color layer baru]
    M --> N[Morph object, selection tetap]
    N --> E

    E --> O{Waktu berjalan atau threshold berubah}
    O --> P[Recalculate urgency, risk, dan alert]
    P --> Q[Update HUD, list, histogram, heatmap, dan log]
    Q --> E

    E --> R{Undo atau redo}
    R --> S[Restore snapshot project]
    S --> J

    E --> T{Import atau export}
    T -- Import valid --> U[Confirm replace lalu persist]
    T -- Import invalid --> V[Error log, data lama tetap]
    T -- Export --> W[Download JSON, CSV, atau PNG]
    U --> E
    V --> E
    W --> E
```

## Jalur happy path

1. Jalankan aplikasi melalui Vite.
2. Load sample atau buat project baru.
3. Tambahkan task dan due date.
4. Klik task pada project card untuk mengubah status.
5. Gunakan layer `PROGRESS` untuk melihat keterisian pekerjaan.
6. Gunakan `URGENCY` atau `RISK` untuk memprioritaskan project.
7. Gunakan deadline heatmap untuk menemukan group dan hari yang padat.
8. Export JSON sebagai checkpoint.

## Jalur pengecualian

- JSON rusak: aplikasi mencatat error dan tidak menimpa data lama.
- Tanggal tidak valid: perubahan ditolak dan event log mencatat kegagalan.
- Tidak ada project: sidebar menampilkan empty state dan stage tetap menjadi area kerja.
- Semua task selesai: project berstatus `DONE` dan tidak lagi menghasilkan alert.
- Undo atau redo: snapshot data dikembalikan tanpa mengubah struktur aplikasi.
- Scene airport atau metro: animation traffic dapat menghasilkan event visual tambahan saat project selesai.
