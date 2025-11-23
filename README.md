# ShopBot Starter (Minimal Version)

Bu basit sürüm:
- Backend (Node.js + Express + Prisma)
- Frontend (React + Vite)
- Shopify için şimdilik MOCK (gerçek API eklenebilir)
- Ürün listeleme demo

## Çalıştırma (Yerel)

1. Node.js 18+ kur.
2. Docker (opsiyonel) ile Postgres & Redis çalıştır:
   docker-compose up -d
3. backend klasörü:
   npm install
   npx prisma migrate dev --name init
   npm run dev
4. ayrı terminal → frontend klasörü:
   npm install
   npm run dev
5. Tarayıcı: http://localhost:3000
6. “Seed Demo Products” butonuna bas → demo ürünler görünür.

Geliştirmek istediğinde gerçek Shopify entegrasyonu için backend/src/services/shopify.ts içindeki mock'u değiştir.

## Codespaces (Tarayıcıda Hızlı Başlangıç)

Bu projeyi lokal kurulum yapmadan GitHub Codespaces üzerinden çalıştırabilirsiniz.

1. Repo sayfasında **Code** düğmesine tıklayın → **Codespaces** sekmesi → **Create codespace on main**.
2. Ortam açıldığında otomatik paket kurulum scripti çalışır (1–2 dk). `setup.sh` tamamlanınca terminale mesajlar düşer.
3. Terminal 1 açın:
   ```bash
   cd backend
   npm run dev
   ```
4. Yeni bir terminal sekmesi (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
5. Codespaces sağ alt/üst Portlar panelinde 4000 ve 5173 listelenir. 5173 portuna tıklayın → **Open in Browser** → Dashboard açılır.
6. İlk veri için `Seed Demo Products` butonuna basın.
7. API test için tarayıcıda: `https://<codespace-url>/api/products` (JSON liste).

Notlar:
- Postgres kullanmak istersen `schema.prisma` içinde provider'ı `postgresql` yapıp `.env` içinde `DATABASE_URL`'ı güncelleyin ve yeniden migrate edin.
- Çok kullanıcılı / abonelik (Stripe) eklemek için sonraki aşamada `User`, `Subscription` modelleri ve Stripe webhook'ları eklenebilir.

## Sonraki Aşamalar
- Auth (Google OAuth veya email/şifre)
- Stripe abonelik entegrasyonu
- AI içerik üretimi (OpenAI, Anthropic, Google Vertex) sağlayıcı katmanı
- Job queue (BullMQ + Redis) ile arka plan görevleri
- Multi-tenant mimari (her kullanıcıya mağaza seti)

## Hızlı Sorun Çözme
| Belirti | Çözüm |
|---------|-------|
| DATABASE_URL yok hatası | `.env` dosyası oluştur / doğru path | 
| Cannot find module './app' | `backend/src/app.ts` dosyası eksik veya adı farklı | 
| Ürünler boş | `/api/seed` endpoint'ini çağır (Seed Demo Products) | 
| Port görünmüyor Codespaces | Codespaces yüklemesi bitmemiş; yeniden aç/yenile | 
| npm install hata | Tekrar deneyin; bağlantı veya cache sorunu olabilir |