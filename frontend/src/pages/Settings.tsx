import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({ baseURL: `${API_URL}/api` });

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: automation } = useQuery({
    queryKey: ['automation-status'],
    queryFn: async () => {
      const response = await api.get('/automation/status');
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await api.patch('/automation/status', updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-status'] });
    },
  });

  const toggleModule = (key: string, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Ayarlar</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ana Otomasyon Kontrolü</h2>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={automation?.masterEnabled || false}
            onChange={(e) => toggleModule('masterEnabled', e.target.checked)}
            className="w-5 h-5 mr-3"
          />
          <span className="text-lg">Otomasyonları Etkinleştir</span>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Modül Ayarları</h2>
        <div className="space-y-4">
          {[
            { key: 'shopifySync', label: 'Shopify Senkronizasyonu' },
            { key: 'aiCategorization', label: 'AI Kategorileme' },
            { key: 'aiContentImprovement', label: 'İçerik İyileştirme' },
            { key: 'googleMerchant', label: 'Google Merchant Center' },
            { key: 'googleAds', label: 'Google Ads' },
            { key: 'metaAds', label: 'Meta Ads (Facebook/Instagram)' },
            { key: 'tiktokAds', label: 'TikTok Ads' },
            { key: 'microsoftAds', label: 'Microsoft Ads' },
            { key: 'seoAutomation', label: 'SEO Otomasyonu' },
            { key: 'socialMediaPosting', label: 'Sosyal Medya Gönderisi' },
          ].map((module) => (
            <label key={module.key} className="flex items-center">
              <input
                type="checkbox"
                checked={automation?.[module.key] || false}
                onChange={(e) => toggleModule(module.key, e.target.checked)}
                className="w-4 h-4 mr-3"
              />
              <span>{module.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
