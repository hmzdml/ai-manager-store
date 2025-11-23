import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface Product {
  id: string;
  title: string;
  vendor?: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [seeded, setSeeded] = useState(false);

  const load = () => {
    axios.get(`${API_URL}/api/products`).then(r => setProducts(r.data));
  };

  const seed = () => {
    axios.post(`${API_URL}/api/seed`).then(() => {
      setSeeded(true);
      load();
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>ShopBot Starter Dashboard</h1>
      <button onClick={seed} disabled={seeded} style={{ padding: '10px 16px', marginBottom: 20 }}>
        {seeded ? 'Seeded ✓' : 'Seed Demo Products'}
      </button>
      <h2>Products</h2>
      {products.length === 0 && <p>No products yet.</p>}
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.title} {p.vendor && <em>({p.vendor})</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
