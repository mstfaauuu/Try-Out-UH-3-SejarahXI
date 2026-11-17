# Try Out UH-3 Sejarah

Website latihan statis untuk GitHub Pages.

## Isi
- 5 paket × 25 soal = 125 soal.
- Tiap paket: 20 PG + 5 PG-MCMA.
- Cakupan mengikuti 25 indikator pada `Kisi-kisi UH 3.pdf`.
- Pembahasan per opsi, evaluasi setiap 10 soal, navigasi nomor, dashboard progres, dan hasil paket.
- Progres disimpan di `localStorage` browser.
- Mode layar penuh diminta saat paket dimulai.
- Deteksi perpindahan tab/halaman melalui Page Visibility API, peringatan visual, penghitung pelanggaran lokal, dan audio peringatan diputar lima kali.
- Audio peringatan menggunakan file `allert.mpeg` yang disertakan.

## Menjalankan lokal
Buka folder dengan VS Code lalu jalankan `index.html` memakai Live Server. Atau gunakan server statis lokal.

## Deploy ke GitHub Pages
1. Buat repository GitHub baru.
2. Upload seluruh isi folder ini (index.html, styles.css, app.js, questions.json, allert.mpeg, README.md).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu Save.
6. Tunggu proses deployment selesai. URL website akan muncul di halaman Pages.

## Fitur integritas ujian dan batasan browser
- Fullscreen hanya dapat diminta setelah tindakan pengguna (misalnya memilih paket). Browser tetap memberi pengguna kendali untuk keluar dari fullscreen.
- Perpindahan tab atau halaman terdeteksi saat halaman menjadi tidak terlihat. Tidak semua bentuk aktivitas di luar halaman dapat diketahui.
- Setelah kembali, peringatan muncul dan audio diputar lima kali. Jika browser membatasi autoplay, gunakan tombol putar ulang pada peringatan.
- Fitur ini berjalan lokal di browser; tidak ada kamera, mikrofon, perekaman layar, atau pengiriman log ke server.

## Catatan teknis
Ini aplikasi frontend statis tanpa backend. Jawaban dan bank soal berada di sisi browser sehingga bukan sistem ujian dengan kunci jawaban rahasia. Progres tersimpan lokal pada browser/perangkat yang digunakan; data tidak tersinkron antarperangkat.

## Sumber materi
- Kisi-kisi UH 3.pdf
- pergerakan nasional (1)_compressed.pdf
- Sumpah Pemuda.pdf
