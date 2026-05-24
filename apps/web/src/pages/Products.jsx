import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from '../api/client.js';
import { formatCurrency } from '../utils.js';

function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">{children}</div>
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

function currency(value) {
  return formatCurrency(value);
}

function StockBadge({ product }) {
  const low = product.stock <= product.stock_min;
  return <span className={low ? 'badge warn' : 'badge'}>{product.stock}</span>;
}

function ProductForm({ initial, stores = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    store_id: initial.store_id || stores[0]?.id || '',
    name: initial.name || '',
    sku: initial.sku || '',
    price: initial.price || '',
    cost: initial.cost || '',
    stock_min: initial.stock_min || ''
  });

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name,
      sku: form.sku,
      price: Number(form.price),
      cost: Number(form.cost || 0),
      stock_min: Number(form.stock_min || 0),
      store_id: form.store_id ? Number(form.store_id) : undefined
    });
  }

  return (
    <form className="form-grid panel" onSubmit={submit} aria-labelledby="product-title">
      <h2 id="product-title">{initial.id ? 'Editar producto' : 'Registrar producto'}</h2>
      {stores.length > 0 && <label>Tienda<select name="store_id" value={form.store_id} onChange={update} required><option value="">Seleccionar</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>}
      <label>Nombre<input name="name" value={form.name} onChange={update} required maxLength={150} /></label>
      <label>SKU<input name="sku" value={form.sku} onChange={update} required maxLength={50} /></label>
      <label>Precio<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} required /></label>
      <label>Costo<input name="cost" type="number" min="0" step="0.01" value={form.cost} onChange={update} /></label>
      <label>Stock minimo<input name="stock_min" type="number" min="0" value={form.stock_min} onChange={update} /></label>
      <div className="form-actions"><button type="button" onClick={onCancel}>Cancelar</button><button className="primary" type="submit">Guardar</button></div>
    </form>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await api(`/products?q=${encodeURIComponent(query)}`);
    setProducts(response.data);
  }

  useEffect(() => {
    load().catch(console.error);
    api('/stores').then(setStores).catch(() => setStores([]));
  }, []);

  async function save(product) {
    setMessage('');
    try {
      if (editing?.id) {
        await api(`/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(product) });
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(product) });
      }
      setEditing(null);
      await load();
      setMessage('Producto guardado.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function remove(id) {
    await api(`/products/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <section>
      <PageHeader title="Productos" subtitle="Catalogo principal de articulos">
        <button className="primary" onClick={() => setEditing({})}><Plus size={18} /> Nuevo</button>
      </PageHeader>
      <div className="toolbar">
        <label className="search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Buscar por nombre o SKU" /></label>
        <button onClick={load}>Buscar</button>
      </div>
      {message && <p className="notice">{message}</p>}
      {editing && <ProductForm initial={editing} stores={stores} onCancel={() => setEditing(null)} onSubmit={save} />}
      <section className="panel">
        <DataTable
          columns={['SKU', 'Producto', 'Categoria', 'Precio', 'Stock', 'Acciones']}
          rows={products.map((product) => [
            product.sku,
            product.name,
            product.category || '-',
            currency(product.price),
            <StockBadge key="stock" product={product} />,
            <span className="actions" key="actions"><button onClick={() => setEditing(product)}>Editar</button><button className="danger-text" onClick={() => remove(product.id)}>Eliminar</button></span>
          ])}
        />
      </section>
    </section>
  );
}