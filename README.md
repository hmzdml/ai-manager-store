# 🤖 AI-Powered Shopify Store Manager

## 🌟 Genel Bakış

Bu sistem, Shopify mağazanızı **tamamen otomatik olarak** yönetmek, optimize etmek ve büyütmek için yapay zeka kullanan kapsamlı bir otomasyon platformudur.

**Ana Özellik:** Mağaza sahibi 5 yıl boyunca hiç müdahale etmese bile, sistem ürünleri kategorize edecek, içerikleri iyileştirecek, reklamları yönetecek, sosyal medya paylaşımları yapacak ve SEO'yu optimize edecek şekilde tasarlanmıştır.

## ✨ Özellikler

### 🛍️ Shopify Entegrasyonu
- Ürünlerin, koleksiyonların, siparişlerin otomatik senkronizasyonu
- Ürün başlıklarını, açıklamalarını ve metadatayı güncelleme
- Otomatik koleksiyon oluşturma ve yönetme

### 🧠 AI-Destekli İşlemler
- **Otomatik Ürün Kategorileme:** GPT-4 kullanarak ürünleri mantıklı kategorilere ayırır
- **İçerik İyileştirme:** SEO-dostu başlıklar, açıklamalar ve meta tag'ler oluşturur
- **Reklam Metni Oluşturma:** Google, Meta, TikTok ve Microsoft reklamları için AI ile içerik üretir
- **Sosyal Medya İçeriği:** Instagram, Facebook ve TikTok için altyazılar ve hashtag'ler üretir
- **Blog Yazıları:** Ürünlerle ilgili SEO-optimized blog içeriği oluşturur

### 🎯 Reklam Platformları
- Google Ads, Meta Ads, TikTok Ads, Microsoft Ads entegrasyonu
- Otomatik bütçe optimizasyonu
- Kampanya performans takibi

### 📱 Sosyal Medya, 🔍 SEO ve 📊 Google Merchant Center
- Otomatik içerik paylaşımı, SEO denetimi ve GMC senkronizasyonu

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Shopify mağazası (Admin API erişimi)
- OpenAI API anahtarı

### 1. Ortam Değişkenlerini Yapılandırın

`.env.example` dosyasını `.env` olarak kopyalayın ve tüm gerekli anahtarları doldurun:

```bash
cp .env.example .env
```

**Önemli değişkenler:**
- `DATABASE_URL` - PostgreSQL bağlantı string'i
- `SHOPIFY_SHOP_URL` - Mağazanızın URL'i
- `SHOPIFY_ACCESS_TOKEN` - Shopify Admin API token'ı
- `OPENAI_API_KEY` - OpenAI API anahtarı
- `REDIS_URL` - Redis bağlantı string'i

### 2. Servisleri Başlatın

**PostgreSQL ve Redis:**
```bash
docker-compose up -d
```

**Backend kurulum ve çalıştırma:**
```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

**Worker süreçleri (ayrı terminal):**
```bash
cd backend
npm run worker:dev
```

**Frontend (ayrı terminal):**
```bash
cd frontend
npm install
npm run dev
```

**Tarayıcıda açın:** http://localhost:5173

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