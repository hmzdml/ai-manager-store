# AI-Powered Shopify Store Manager - Kurulum Talimatları

## 🎯 Hızlı Başlangıç

Bu sistem, Shopify mağazanızı 5 yıl boyunca tamamen otomatik olarak yönetebilir.

### Sistemi İlk Kez Çalıştırma

**1. Docker Desktop'ı indirip kurun:**
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: https://docs.docker.com/engine/install/

**2. Node.js'i indirip kurun (18 veya üzeri):**
   - https://nodejs.org/

**3. Projeyi bilgisayarınıza indirin:**

   **Seçenek A - GitHub'dan indirme (önerilen):**
   ```bash
   git clone https://github.com/hmzdml/ai-manager-store.git
   cd ai-manager-store
   ```

   **Seçenek B - ZIP olarak indirme:**
   - GitHub sayfasına gidin: https://github.com/hmzdml/ai-manager-store
   - Yeşil "Code" butonuna tıklayın
   - "Download ZIP" seçeneğini seçin
   - İndirilen dosyayı istediğiniz klasöre çıkarın
   - Terminalden bu klasöre gidin

   **Seçenek C - Bu Codespaces'ten kendi bilgisayarınıza kopyalama:**
   - Terminal'de şu komutu çalıştırın:
   ```bash
   tar -czf ai-manager-store.tar.gz /workspaces/ai-manager-store
   ```
   - Dosyayı Codespaces'ten indirin
   - Kendi bilgisayarınızda arşivi açın

**4. Ortam değişkenlerini ayarlayın:**
   - `.env.example` dosyasını `.env` olarak kopyalayın
   - Shopify mağaza bilgilerinizi ekleyin
   - OpenAI API anahtarınızı ekleyin

**5. Terminalde şu komutları çalıştırın:**

```bash
# Veritabanı ve Redis'i başlat
docker-compose up -d

# Backend'i hazırla ve çalıştır
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

**6. Yeni bir terminal açıp worker'ı başlatın:**

```bash
cd backend
npm run worker:dev
```

**7. Yeni bir terminal açıp frontend'i başlatın:**

```bash
cd frontend
npm install
npm run dev
```

**8. Tarayıcınızda açın:**
   - http://localhost:5173

## 🎮 Kullanım

1. **Ayarlar** sayfasından modülleri açın/kapatın
2. Sistem otomatik olarak çalışmaya başlar
3. Dashboard'dan istatistikleri takip edin

## 🔐 Gerekli API Anahtarları

### Shopify (Zorunlu)
1. Shopify Admin → Settings → Apps and sales channels
2. "Develop apps" → "Create an app"
3. Admin API access token'ı alın
4. `.env` dosyasına ekleyin

### OpenAI (Zorunlu)
1. https://platform.openai.com/ → API keys
2. Yeni anahtar oluşturun
3. `.env` dosyasına ekleyin

### Reklam Platformları (İsteğe Bağlı)
- Google Ads: https://ads.google.com/
- Meta Ads: https://developers.facebook.com/
- TikTok Ads: https://business-api.tiktok.com/

## 💡 Önemli Notlar

- İlk çalıştırmada ürünlerin senkronize edilmesi birkaç dakika sürebilir
- AI işlemleri OpenAI API maliyeti oluşturur (günlük limit ayarlanabilir)
- Reklam modülleri gerçek para harcayabilir - dikkatli kullanın!
- Sosyal medya gönderileri önce "draft" olarak oluşturulur

## ⚠️ Sorun Giderme

**"Database connection failed"**
- Docker'ın çalıştığından emin olun: `docker ps`
- `docker-compose up -d` komutuyla servisleri başlatın

**"OpenAI API error"**
- API anahtarınızın geçerli olduğunu kontrol edin
- Hesabınızda kredi olduğundan emin olun

**"Shopify API error"**
- Mağaza URL'inin doğru olduğunu kontrol edin
- Access token'ın geçerli olduğunu kontrol edin

## 📞 Destek

Sorularınız için GitHub Issues kullanın.
