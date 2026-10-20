# Deploy Smart OEE ke oee.ptsein.com

Static site (nginx) + Cloudflare Tunnel. Tidak perlu membuka port, tidak bentrok dengan www.ptsein.com.

## 1. Buat tunnel di Cloudflare
1. Cloudflare Dashboard → **Zero Trust → Networks → Tunnels → Create a tunnel** → Cloudflared.
2. Nama: `smart-oee`. Salin **token** (string panjang dari perintah install).
3. Tab **Public Hostname → Add**:
   - Subdomain: `oee`, Domain: `ptsein.com`
   - Service: **HTTP**, URL: `smart-oee:80`
4. Save. DNS `oee.ptsein.com` dibuat otomatis (CNAME, proxied).

## 2. Jalankan di server
```bash
# upload folder project ke server, mis. /opt/smart-oee
cd /opt/smart-oee/deploy
echo "TUNNEL_TOKEN=ISI_TOKEN_ANDA" > .env
docker compose up -d --build
```
Buka https://oee.ptsein.com

## Update tampilan
Upload file yang berubah, lalu:
```bash
cd /opt/smart-oee/deploy && docker compose up -d --build smart-oee
```

## Alternatif tanpa Tunnel
Jika server sudah memakai nginx/Caddy/Traefik untuk www.ptsein.com:
1. Cloudflare DNS: A record `oee` → IP server (Proxied).
2. Hapus service `cloudflared`, tambahkan `ports: ["8081:80"]` pada `smart-oee`.
3. Di reverse proxy yang ada, buat server block `oee.ptsein.com` → `http://127.0.0.1:8081`.
4. SSL/TLS mode Cloudflare: Full.

## Catatan
- Halaman memuat React/Babel dari unpkg dan font dari Google Fonts, jadi pengunjung butuh internet. Untuk offline/intranet, minta versi bundel satu file.
- Ini masih prototipe dengan data contoh; belum ada login. Pasang **Cloudflare Access** (Zero Trust → Access → Applications) pada `oee.ptsein.com` agar hanya karyawan yang bisa masuk.
