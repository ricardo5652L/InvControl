import { useEffect, useMemo, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import { api } from '../api/client.js';
import { formatCurrency } from '../utils.js';

function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}

function currency(value) {
  return formatCurrency(value);
}

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.quantity * item.price, 0), [cart]);

  useEffect(() => {
    api('/products?limit=100').then((response) => setProducts(response.data)).catch(console.error);
  }, []);

  function add(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { ...product, quantity: 1 }];
    });
  }

  async function submit() {
    await api('/sales', {
      method: 'POST',
      body: JSON.stringify({ payment_method: 'cash', items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity, unit_price: item.price })) })
    });
    setCart([]);
    const response = await api('/products?limit=100');
    setProducts(response.data);
  }

  return (
    <section>
      <PageHeader title="Ventas" subtitle="Registro rapido de salida por venta" />
      <div className="sale-layout">
        <section className="panel">
          <h2>Productos disponibles</h2>
          <div className="product-grid">
            {products.map((product) => <button className="product-tile" key={product.id} onClick={() => add(product)} disabled={product.stock <= 0}><strong>{product.name}</strong><span>{currency(product.price)}</span><small>Stock {product.stock}</small></button>)}
          </div>
        </section>
        <aside className="panel checkout">
          <h2>Resumen</h2>
          {cart.map((item) => <div className="cart-line" key={item.id}><span>{item.name} x{item.quantity}</span><strong>{currency(item.price * item.quantity)}</strong></div>)}
          <div className="total"><span>Total</span><strong>{currency(total)}</strong></div>
          <button className="primary" disabled={!cart.length} onClick={submit}><ReceiptText size={18} /> Registrar venta</button>
        </aside>
      </div>
    </section>
  );
}