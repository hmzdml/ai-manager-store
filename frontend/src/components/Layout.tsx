import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Package, FolderTree, TrendingUp, Share2, 
  Search, Settings, Activity 
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Ürünler', href: '/products', icon: Package },
    { name: 'Kategoriler', href: '/categories', icon: FolderTree },
    { name: 'Reklamlar', href: '/ads', icon: TrendingUp },
    { name: 'Sosyal Medya', href: '/social', icon: Share2 },
    { name: 'SEO', href: '/seo', icon: Search },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">AI Store Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Otomatik Mağaza Yönetimi</p>
        </div>
        <nav className="p-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
