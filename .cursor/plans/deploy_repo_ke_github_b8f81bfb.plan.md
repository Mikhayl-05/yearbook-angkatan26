---
name: Deploy Repo ke GitHub
overview: Menyiapkan repository lokal yang sudah ada agar terhubung ke GitHub milikmu, lalu melakukan commit dan push pertama dengan aman.
todos:
  - id: create-github-repo
    content: Buat repository kosong baru di akun GitHub tanpa README/.gitignore/license
    status: pending
  - id: stage-and-commit
    content: Stage semua perubahan lokal dan buat commit pertama
    status: pending
  - id: connect-remote
    content: Tambahkan atau perbarui remote origin ke URL repo GitHub
    status: pending
  - id: first-push
    content: Push branch lokal (main/master) ke origin dan verifikasi di GitHub
    status: pending
isProject: false
---

# Deploy repo ini ke GitHub akunmu

## Tujuan
Menghubungkan project lokal `yearbook-angkatan26` ke repository GitHub milikmu lalu mendorong (`push`) seluruh perubahan.

## Langkah-langkah
1. **Buat repository baru di GitHub**
   - Buka [https://github.com/new](https://github.com/new)
   - Isi nama repo (misalnya `yearbook-angkatan26`)
   - Pilih `Public` atau `Private`
   - **Jangan centang** `Add a README`, `.gitignore`, atau `license` (karena project lokalmu sudah punya isi)

2. **Cek status git lokal**
   - Jalankan `git status`
   - Pastikan kamu tahu file apa saja yang sudah berubah sebelum commit

3. **Tambahkan semua perubahan ke staging**
   - Jalankan `git add .`

4. **Buat commit**
   - Jalankan `git commit -m "Initial upload project"`
   - Jika diminta identity, set dulu:
     - `git config --global user.name "NamaKamu"`
     - `git config --global user.email "emailkamu@example.com"`

5. **Hubungkan ke remote GitHub**
   - Ambil URL repo GitHub yang barusan dibuat, contoh:
     - HTTPS: `https://github.com/usernamekamu/yearbook-angkatan26.git`
   - Tambahkan remote origin:
     - `git remote add origin https://github.com/usernamekamu/yearbook-angkatan26.git`
   - Jika `origin` sudah ada, ganti URL-nya:
     - `git remote set-url origin https://github.com/usernamekamu/yearbook-angkatan26.git`

6. **Push branch utama ke GitHub**
   - Cek nama branch lokal:
     - `git branch --show-current`
   - Kalau branch kamu `main`:
     - `git push -u origin main`
   - Kalau branch kamu `master`:
     - `git push -u origin master`

7. **Verifikasi**
   - Refresh halaman repo GitHub
   - Pastikan file project muncul semua

## Catatan penting
- Dari status yang terlihat, repo kamu sudah punya beberapa file yang berubah (belum commit), jadi pastikan perubahan itu memang ingin ikut di-upload.
- Kalau login diminta saat push via HTTPS, gunakan **GitHub Personal Access Token** (bukan password akun GitHub).
- Setelah push pertama berhasil, push berikutnya cukup pakai:
  - `git add .`
  - `git commit -m "pesan commit"`
  - `git push`