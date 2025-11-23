import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Ads from './pages/Ads';
import Social from './pages/Social';
import SEO from './pages/SEO';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/social" element={<Social />} />
        <Route path="/seo" element={<SEO />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
