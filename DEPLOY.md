# Render.com'da Deployment Rehberi

## Adım 1: Render Hesabı Oluşturma

1. [render.com](https://render.com) adresine gidin
2. **"Get Started for Free"** butonuna tıklayın
3. **"GitHub ile giriş yap"** seçeneğini seçin
4. GitHub hesabınızı (hmzdml) bağlayın

## Adım 2: Blueprint ile Otomatik Kurulum

1. Render Dashboard'da **"New +"** butonuna tıklayın
2. **"Blueprint"** seçeneğini seçin
3. Repository olarak **"hmzdml/ai-manager-store"** seçin
4. Render otomatik olarak `render.yaml` dosyasını bulacak

## Adım 3: Servisler Oluşturulacak

Render aşağıdaki servisleri otomatik oluşturacak:

### 1. PostgreSQL Database (ai-manager-db)
- ✅ Otomatik oluşturulacak
- ✅ Ücretsiz plan
- ✅ Backend'e otomatik bağlanacak

### 2. Backend API (ai-manager-backend)
- URL: `https://ai-manager-backend.onrender.com`
- ✅ Node.js ortamı
- ✅ Otomatik build ve deploy
- ⚠️ İlk çalıştırmada 2-3 dakika sürebilir

### 3. Frontend Dashboard (ai-manager-frontend)
- URL: `https://ai-manager-frontend.onrender.com`
- ✅ Static site hosting
- ✅ Otomatik React build

## Adım 4: Gerekli Environment Variables Ekleme

Blueprint servisleri oluşturduktan sonra, backend servisine tıklayın ve **"Environment"** sekmesinden aşağıdaki değişkenleri ekleyin:

### Zorunlu (Sistemi çalıştırmak için):
```
SHOPIFY_STORE_URL=sizin-magaza.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx (Shopify Admin'den alın)
OPENAI_API_KEY=sk-xxxxx (OpenAI'dan alın)
```

### Opsiyonel (Reklamlar için):
```
REDIS_URL=redis://red-xxxxx:6379 (İsteğe bağlı - Upstash Redis kullanabilirsiniz)
GOOGLE_ADS_DEVELOPER_TOKEN=xxxxx
META_ACCESS_TOKEN=xxxxx
TIKTOK_ACCESS_TOKEN=xxxxx
MICROSOFT_CLIENT_ID=xxxxx
```

## Adım 5: Redis Ekleme (Worker Jobs için)

Worker sisteminin çalışması için Redis gerekli. İki seçenek:

### Seçenek A: Upstash Redis (Önerilen - Ücretsiz)
1. [upstash.com](https://upstash.com) hesabı açın
2. Yeni Redis database oluşturun
3. Connection string'i kopyalayın: `redis://default:xxxxx@xxxxx.upstash.io:6379`
4. Render backend environment'a `REDIS_URL` olarak ekleyin

### Seçenek B: Render Redis (Ücretli)
1. Render Dashboard'da **"New +" → "Redis"** seçin
2. Ücretsiz plan yok, en ucuz $7/ay
3. Oluşturulduktan sonra connection string'i backend'e ekleyin

## Adım 6: Deployment Başlatma

1. Environment variables eklendikten sonra **"Manual Deploy"** tıklayın
2. Backend deploy edilecek (5-10 dakika)
3. Logları izleyin: "Logs" sekmesinden

## Adım 7: Database Migration

Backend ilk kez çalıştığında otomatik olarak:
```bash
npx prisma db push
```
komutu çalışacak ve tüm tablolar oluşturulacak.

## Adım 8: Test Etme

1. Frontend URL'sine gidin: `https://ai-manager-frontend.onrender.com`
2. Dashboard açılmalı
3. Ayarlar sayfasından modülleri kontrol edin
4. Backend API'yi test edin: `https://ai-manager-backend.onrender.com/api/health`

## Sorun Giderme

### Backend çalışmıyor
- Logs sekmesinden hataları kontrol edin
- `DATABASE_URL` değişkeninin doğru ayarlandığından emin olun
- PostgreSQL database'in "Available" durumda olduğunu kontrol edin

### Frontend backend'e bağlanamıyor
- Backend URL'nin doğru olduğundan emin olun
- CORS ayarları backend'de yapılmış durumda
- Browser console'da network hatalarını kontrol edin

### Worker jobs çalışmıyor
- `REDIS_URL` environment variable'ının eklendiğinden emin olun
- Redis connection string formatını kontrol edin
- Backend logs'da "Connected to Redis" mesajını arayın

## Ücretsiz Plan Limitleri

⚠️ Render ücretsiz planda:
- 15 dakika hareketsizlikten sonra servisler uyur
- İlk istek 30-60 saniye gecikebilir
- Aylık 750 saat çalışma süresi (Backend + Frontend = 2 servis)

💡 **Sürekli çalışması için**: Ücretli plana ($7/ay/servis) geçebilirsiniz.

## Shopify Admin Access Token Alma

1. Shopify Admin'e gidin
2. **Settings → Apps and sales channels → Develop apps**
3. **"Create an app"** tıklayın
4. App adı: "AI Manager"
5. **Admin API scopes** kısmından şu izinleri seçin:
   - `read_products, write_products`
   - `read_orders`
   - `read_inventory, write_inventory`
   - `read_content, write_content`
6. **"Install app"** tıklayın
7. **Admin API access token** gösterilecek - kopyalayın
8. Token formatı: `shpat_xxxxxxxxxxxxxxxxxxxxx`

## OpenAI API Key Alma

1. [platform.openai.com](https://platform.openai.com) hesabı açın
2. Kredi kartı ekleyin (kullanım başına ücretlendirme)
3. **API Keys** bölümüne gidin
4. **"Create new secret key"** tıklayın
5. Key'i kopyalayın: `sk-xxxxxxxxxxxxxxxxxxxxx`
6. İlk $5 ücretsiz kredi veriliyor

## Sonraki Adımlar

✅ Sistem çalışıyor olmalı
✅ Ürünler Shopify'dan senkronize edilecek
✅ AI kategorileme başlayacak
✅ Dashboard'dan tüm işlemleri kontrol edebilirsiniz

🎉 **Tebrikler! Sisteminiz çalışıyor.**

Sorularınız için: [GitHub Issues](https://github.com/hmzdml/ai-manager-store/issues)
