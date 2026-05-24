import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

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

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>) : <tr><td colSpan={columns.length}>Sin datos</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({ product_id: '', type: 'IN', quantity: 1, reason: '' });

  async function load() {
    const [productResponse, movementResponse] = await Promise.all([api('/products?limit=100'), api('/inventory/movements')]);
    setProducts(productResponse.data);
    setMovements(movementResponse);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function submit(event) {
    event.preventDefault();
    await api('/inventory/movements', { method: 'POST', body: JSON.stringify({ ...form, quantity: Number(form.quantity) }) });
    setForm({ product_id: '', type: 'IN', quantity: 1, reason: '' });
    await load();
  }

  return (
    <section>
      <PageHeader title="Inventario" subtitle="Entradas, salidas y ajustes de stock" />
      <form className="form-grid panel" onSubmit={submit}>
        <label>Producto<select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required><option value="">Seleccionar</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
        <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="IN">Entrada</option><option value="OUT">Salida</option><option value="ADJUSTMENT">Ajuste</option></select></label>
        <label>Cantidad<input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label>
        <label>Motivo<input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
        <div className="form-actions"><button className="primary" type="submit">Registrar movimiento</button></div>
      </form>
      <section className="panel">
        <h2>Historial</h2>
        <DataTable columns={['Producto', 'Tipo', 'Cantidad', 'Motivo']} rows={movements.map((item) => [item.product, item.type, item.quantity, item.reason || '-'])} />
      </section>
    </section>
  );
}