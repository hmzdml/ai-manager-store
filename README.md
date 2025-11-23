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
