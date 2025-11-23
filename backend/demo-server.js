/**
 * DEMO BACKEND - Basit Mock Sunucu
 * Gerçek veritabanı olmadan çalışır
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
let automationStatus = {
  masterEnabled: true,
  shopifySync: true,
  aiCategorization: true,
  aiContentImprovement: true,
  googleMerchant: true,
  googleAds: false,
  metaAds: false,
  tiktokAds: false,
  microsoftAds: false,
  seoAutomation: true,
  socialMediaPosting: true,
  pausedUntil: null,
};

const mockProducts = [
  {
    id: '1',
    title: 'Premium T-Shirt',
    description: 'Yüksek kaliteli pamuklu tişört',
    vendor: 'FashionBrand',
    productType: 'Giyim',
    status: 'active',
    price: 29.99,
    tags: ['giyim', 'erkek', 'casual'],
  },
  {
    id: '2',
    title: 'Spor Ayakkabı',
    description: 'Rahat ve şık koşu ayakkabısı',
    vendor: 'SportyShoes',
    productType: 'Ayakkabı',
    status: 'active',
    price: 89.99,
    tags: ['ayakkabı', 'spor', 'koşu'],
  },
];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Demo mode çalışıyor!' });
});

// Automation status
app.get('/api/automation/status', (req, res) => {
  res.json(automationStatus);
});

app.patch('/api/automation/status', (req, res) => {
  automationStatus = { ...automationStatus, ...req.body };
  res.json(automationStatus);
});

// Dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    products: {
      total: mockProducts.length,
      categorized: 2,
    },
    shopify: {
      totalOrders: 45,
      totalRevenue: 1250.50,
      averageOrderValue: 27.79,
    },
    ads: {
      active: 3,
    },
    social: {
      scheduled: 5,
    },
    ai: {
      tokensUsedToday: 12450,
      costToday: 0.0245,
    },
    recentActivity: [
      {
        id: '1',
        module: 'shopify',
        action: 'sync_products',
        status: 'success',
        message: 'Ürünler senkronize edildi',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        module: 'ai',
        action: 'categorize_products',
        status: 'success',
        message: '2 ürün kategorize edildi',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        module: 'social',
        action: 'post',
        status: 'success',
        message: 'Instagram\'a gönderi paylaşıldı',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  });
});

// Products
app.get('/api/products', (req, res) => {
  res.json({
    products: mockProducts,
    pagination: {
      page: 1,
      limit: 50,
      total: mockProducts.length,
      pages: 1,
    },
  });
});

// Config
app.get('/api/config', (req, res) => {
  res.json({
    content_auto_apply: 'false',
    batch_size: '30',
  });
});

// Ads overview
app.get('/api/ads/overview', (req, res) => {
  res.json({
    google: { campaigns: 1, spent: 45.50, impressions: 1200, clicks: 45, conversions: 3, revenue: 150 },
    meta: { campaigns: 1, spent: 35.20, impressions: 980, clicks: 32, conversions: 2, revenue: 85 },
    tiktok: { campaigns: 1, spent: 20.10, impressions: 550, clicks: 18, conversions: 1, revenue: 45 },
    microsoft: { campaigns: 0, spent: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
  });
});

// Social posts
app.get('/api/social/posts', (req, res) => {
  res.json([
    {
      id: '1',
      platform: 'instagram',
      caption: 'Yeni koleksiyonumuz çıktı! 🎉',
      hashtags: ['moda', 'yenikoleksiyon', 'alışveriş'],
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    },
  ]);
});

// SEO health
app.get('/api/seo/health', (req, res) => {
  res.json({
    stats: {
      totalIssues: 5,
      averageScore: 75,
      missingTitles: 2,
      missingDescriptions: 3,
      duplicates: 0,
    },
    audits: [],
  });
});

// GMC health
app.get('/api/gmc/health', (req, res) => {
  res.json({
    approved: 8,
    disapproved: 1,
    warning: 1,
  });
});

// Logs
app.get('/api/logs', (req, res) => {
  res.json({
    logs: [
      {
        id: '1',
        module: 'shopify',
        action: 'sync',
        status: 'success',
        message: 'Senkronizasyon başarılı',
        createdAt: new Date().toISOString(),
      },
    ],
    pagination: { page: 1, limit: 50, total: 1, pages: 1 },
  });
});

app.listen(PORT, () => {
  console.log(`\n🎉 DEMO BACKEND ÇALIŞIYOR!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`\n✅ Artık tarayıcınızda paneli görebilirsiniz!\n`);
});
