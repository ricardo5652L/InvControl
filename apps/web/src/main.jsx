import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, BarChart3, Boxes, Camera, ClipboardPlus, Download, Eye, EyeOff, LayoutDashboard, LogOut, MapPinned, PackagePlus, Plus, ReceiptText, Search, ShoppingCart, Store, UserRound, UsersRound, X } from 'lucide-react';
import './styles.css';
import { formatCurrency } from './utils.js';
import logoUrl from './assets/invcontrol-logo.svg';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const THEME_KEY = 'invcontrol-theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme || 'system';
}

async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(error.message || 'Error de API');
  }

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function currency(value) {
  return formatCurrency(value);
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [view, setView] = useState('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || 'system');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function handleLogin(session) {
    localStorage.setItem('token', session.token);
    localStorage.setItem('user', JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
  }

  function updateUser(nextUser) {
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
  }

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src={logoUrl} alt="InvControl" />
          <div>
            <small>{user?.storeName || user?.name}</small>
          </div>
        </div>
        <nav aria-label="Principal">
          <NavButton icon={<LayoutDashboard />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavButton icon={<ClipboardPlus />} label="Altas" active={view === 'quick'} onClick={() => setView('quick')} />
          <NavButton icon={<Boxes />} label="Productos" active={view === 'products'} onClick={() => setView('products')} />
          <NavButton icon={<PackagePlus />} label="Inventario" active={view === 'inventory'} onClick={() => setView('inventory')} />
          <NavButton icon={<ShoppingCart />} label="Ventas" active={view === 'sales'} onClick={() => setView('sales')} />
          <NavButton icon={<BarChart3 />} label="Reportes" active={view === 'reports'} onClick={() => setView('reports')} />
          {user?.role === 'admin' && <NavButton icon={<MapPinned />} label="Tiendas" active={view === 'stores'} onClick={() => setView('stores')} />}
          {user?.role === 'admin' && <NavButton icon={<UsersRound />} label="Usuarios" active={view === 'users'} onClick={() => setView('users')} />}
        </nav>
        <button className="ghost danger" onClick={logout}><LogOut size={18} /> Salir</button>
      </aside>
      <main className="content">
        <div className="topbar">
          <ProfileBubble user={user} onOpen={() => setProfileOpen(true)} />
        </div>
        {view === 'dashboard' && <Dashboard />}
        {view === 'quick' && <QuickCreate setView={setView} isAdmin={user?.role === 'admin'} />}
        {view === 'products' && <Products />}
        {view === 'inventory' && <Inventory />}
        {view === 'sales' && <Sales />}
        {view === 'reports' && <Reports />}
        {view === 'stores' && user?.role === 'admin' && <Stores />}
        {view === 'users' && user?.role === 'admin' && <Users />}
      </main>
      {profileOpen && <ProfileModal currentUser={user} theme={theme} onThemeChange={setTheme} onClose={() => setProfileOpen(false)} onSaved={updateUser} />}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return <button className={active ? 'nav active' : 'nav'} onClick={onClick}>{React.cloneElement(icon, { size: 18 })}<span>{label}</span></button>;
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'IC';
}

function ProfileBubble({ user, onOpen }) {
  return (
    <button className="profile-bubble" onClick={onOpen} aria-label="Abrir perfil">
      <span className="profile-meta">
        <strong>{user?.name}</strong>
        <small>{user?.role === 'admin' ? 'Manager' : 'Trabajador'} · {user?.storeName}</small>
      </span>
      <span className="avatar">
        {user?.photoUrl ? <img src={user.photoUrl} alt="" /> : initials(user?.name)}
      </span>
    </button>
  );
}

function ProfileModal({ currentUser, theme, onThemeChange, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
    photo_url: currentUser?.photoUrl || ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function pickPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Selecciona una imagen valida.');
      return;
    }

    if (file.size > 500000) {
      setMessage('La fotografia debe pesar menos de 500 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, photo_url: reader.result }));
    reader.readAsDataURL(file);
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const payload = {
        name: form.name,
        email: form.email,
        photo_url: form.photo_url
      };
      if (form.password) payload.password = form.password;
      const updated = await api('/me', { method: 'PUT', body: JSON.stringify(payload) });
      onSaved(updated);
      onClose();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <header>
          <div>
            <h2 id="profile-title">Mi perfil</h2>
            <p>Actualiza solo tus datos personales permitidos.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </header>
        <form onSubmit={submit} className="profile-form">
          <div className="profile-photo-block">
            <span className="avatar avatar-large">
              {form.photo_url ? <img src={form.photo_url} alt="" /> : initials(form.name)}
            </span>
            <label className="photo-picker">
              <Camera size={18} />
              Subir fotografia
              <input type="file" accept="image/*" onChange={pickPhoto} />
            </label>
            {form.photo_url && <button type="button" onClick={() => setForm({ ...form, photo_url: '' })}>Quitar foto</button>}
          </div>
          <div className="locked-fields">
            <span><UserRound size={16} /> {currentUser?.role === 'admin' ? 'Manager' : 'Trabajador'}</span>
            <span><Store size={16} /> {currentUser?.storeName}</span>
          </div>
          <label>Tema de interfaz<select value={theme} onChange={(event) => onThemeChange(event.target.value)}><option value="system">Sistema del dispositivo</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label>
          <label>Nombre<input name="name" value={form.name} onChange={update} required maxLength={120} /></label>
          <label>Correo<input name="email" type="email" value={form.email} onChange={update} required maxLength={160} /></label>
          <label className="password-field">
            Nueva contrasena
            <div className="password-input-wrapper">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update} minLength={6} placeholder="Dejar vacia para conservar" />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {message && <p className="error">{message}</p>}
          <div className="form-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Guardar cambios</button></div>
        </form>
      </section>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      onLogin(await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={submit}>
        <img className="login-logo" src={logoUrl} alt="InvControl" />
        <p>Gestion de inventarios, ventas y reportes para tiendas minoristas.</p>
        <label>
          Correo
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="username" />
        </label>
        <label className="password-field">
          Contrasena
          <div className="password-input-wrapper">
            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">Entrar</button>
      </form>
    </main>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setData).catch(console.error);
  }, []);

  return (
    <section>
      <PageHeader title="Dashboard" subtitle="Indicadores principales del negocio" />
      <div className="kpis">
        <Kpi label="Ventas hoy" value={currency(data?.total_sales_today)} />
        <Kpi label="Ordenes hoy" value={data?.orders_today || 0} />
        <Kpi label="Stock bajo" value={data?.low_stock_count || 0} tone="warn" />
        <Kpi label="Valor inventario" value={currency(data?.inventory_value)} />
      </div>
      <section className="panel">
        <h2>Ultimos movimientos</h2>
        <DataTable
          columns={['Producto', 'Tipo', 'Cantidad', 'Motivo']}
          rows={(data?.recent_movements || []).map((movement) => [movement.product, movement.type, movement.quantity, movement.reason || '-'])}
        />
      </section>
    </section>
  );
}

function QuickCreate({ setView, isAdmin }) {
  const actions = [
    { title: 'Alta de producto', text: 'Registrar articulos nuevos en el catalogo.', icon: <Boxes />, view: 'products' },
    { title: 'Entrada de inventario', text: 'Sumar compra o ajuste al stock disponible.', icon: <PackagePlus />, view: 'inventory' },
    { title: 'Nueva venta', text: 'Registrar salida por venta y descontar stock.', icon: <ShoppingCart />, view: 'sales' },
    ...(isAdmin ? [
      { title: 'Nuevo trabajador', text: 'Crear inicio de sesion para un empleado.', icon: <UsersRound />, view: 'users' },
      { title: 'Nueva tienda afiliada', text: 'Registrar sucursal y ubicarla en Google Maps.', icon: <Store />, view: 'stores' }
    ] : [])
  ];

  return (
    <section>
      <PageHeader title="Altas" subtitle="Accesos rapidos para registrar informacion nueva" />
      <div className="quick-grid">
        {actions.map((action) => (
          <button className="quick-card" key={action.title} onClick={() => setView(action.view)}>
            {React.cloneElement(action.icon, { size: 24 })}
            <strong>{action.title}</strong>
            <span>{action.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Kpi({ label, value, tone }) {
  return <article className={`kpi ${tone || ''}`}><small>{label}</small><strong>{value}</strong></article>;
}

function Products() {
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

function Inventory() {
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

function Sales() {
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

function Reports() {
  const [lowStock, setLowStock] = useState([]);
  const [sales, setSales] = useState(null);

  useEffect(() => {
    Promise.all([api('/reports/low-stock'), api('/reports/sales')]).then(([low, salesReport]) => {
      setLowStock(low);
      setSales(salesReport);
    });
  }, []);

  async function download(type) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reports/export.csv?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <PageHeader title="Reportes" subtitle="Indicadores exportables">
        <button onClick={() => download('products')}><Download size={18} /> CSV productos</button>
      </PageHeader>
      <div className="kpis">
        <Kpi label="Ventas totales" value={currency(sales?.total_sales)} />
        <Kpi label="Ordenes" value={sales?.orders || 0} />
        <Kpi label="Articulos vendidos" value={sales?.items_sold || 0} />
      </div>
      <section className="panel">
        <h2><AlertTriangle size={18} /> Stock bajo</h2>
        <DataTable columns={['SKU', 'Producto', 'Stock', 'Minimo']} rows={lowStock.map((product) => [product.sku, product.name, product.stock, product.stock_min])} />
      </section>
    </section>
  );
}

function Stores() {
  const [stores, setStores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await api('/stores');
    setStores(response);
    setSelected((current) => current || response[0] || null);
  }

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

  async function save(store) {
    setMessage('');
    try {
      if (editing?.id) {
        await api(`/stores/${editing.id}`, { method: 'PUT', body: JSON.stringify(store) });
      } else {
        await api('/stores', { method: 'POST', body: JSON.stringify(store) });
      }
      setEditing(null);
      await load();
      setMessage('Tienda guardada.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  const mapStore = selected || stores[0];
  const mapQuery = mapStore ? `${mapStore.latitude},${mapStore.longitude}` : 'Balancan,Tabasco,Mexico';

  return (
    <section>
      <PageHeader title="Tiendas afiliadas" subtitle="Sucursales con inicio de sesion y ubicacion en Google Maps">
        <button className="primary" onClick={() => setEditing({})}><Plus size={18} /> Nueva tienda</button>
      </PageHeader>
      {message && <p className="notice">{message}</p>}
      {editing && <StoreForm initial={editing} onCancel={() => setEditing(null)} onSubmit={save} />}
      <div className="stores-layout">
        <section className="panel">
          <h2>Sucursales</h2>
          <div className="store-list">
            {stores.map((store) => (
              <button className={selected?.id === store.id ? 'store-item active' : 'store-item'} key={store.id} onClick={() => setSelected(store)}>
                <strong>{store.name}</strong>
                <span>{store.code} · {store.address || 'Sin direccion'}</span>
                <small>{store.latitude}, {store.longitude}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="panel map-panel">
          <h2><MapPinned size={18} /> Mapa</h2>
          <iframe title="Mapa de tienda afiliada" src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`} loading="lazy" />
          {mapStore && <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer">Abrir en Google Maps</a>}
        </section>
      </div>
    </section>
  );
}

function StoreForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    code: initial.code || '',
    address: initial.address || '',
    phone: initial.phone || '',
    latitude: initial.latitude || '',
    longitude: initial.longitude || '',
    is_active: initial.isActive ?? true
  });

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name,
      code: form.code,
      address: form.address,
      phone: form.phone,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      is_active: form.is_active
    });
  }

  return (
    <form className="form-grid panel" onSubmit={submit} aria-labelledby="store-title">
      <h2 id="store-title">{initial.id ? 'Editar tienda' : 'Registrar tienda afiliada'}</h2>
      <label>Nombre<input name="name" value={form.name} onChange={update} required maxLength={120} /></label>
      <label>Codigo<input name="code" value={form.code} onChange={update} required maxLength={30} /></label>
      <label>Direccion<input name="address" value={form.address} onChange={update} maxLength={255} /></label>
      <label>Telefono<input name="phone" value={form.phone} onChange={update} maxLength={30} /></label>
      <label>Latitud<input name="latitude" type="number" step="0.000001" value={form.latitude} onChange={update} required /></label>
      <label>Longitud<input name="longitude" type="number" step="0.000001" value={form.longitude} onChange={update} required /></label>
      <label className="check-row"><input name="is_active" checked={form.is_active} onChange={update} type="checkbox" /> Tienda activa</label>
      <div className="form-actions"><button type="button" onClick={onCancel}>Cancelar</button><button className="primary" type="submit">Guardar tienda</button></div>
    </form>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    setUsers(await api('/users'));
  }

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
    api('/stores').then(setStores).catch(() => setStores([]));
  }, []);

  async function save(user) {
    setMessage('');
    try {
      if (editing?.id) {
        await api(`/users/${editing.id}`, { method: 'PUT', body: JSON.stringify(user) });
      } else {
        await api('/users', { method: 'POST', body: JSON.stringify(user) });
      }
      setEditing(null);
      await load();
      setMessage('Usuario guardado.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function deactivate(id) {
    setMessage('');
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      await load();
      setMessage('Usuario desactivado.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section>
      <PageHeader title="Usuarios" subtitle="Cuentas de manager y trabajadores">
        <button className="primary" onClick={() => setEditing({ role: 'employee' })}><Plus size={18} /> Nuevo trabajador</button>
      </PageHeader>
      {message && <p className="notice">{message}</p>}
      {editing && <UserForm initial={editing} stores={stores} onCancel={() => setEditing(null)} onSubmit={save} />}
      <section className="panel">
        <DataTable
          columns={['Nombre', 'Correo', 'Tienda', 'Rol', 'Estado', 'Acciones']}
          rows={users.map((item) => [
            item.name,
            item.email,
            item.store || '-',
            item.role === 'admin' ? 'Manager' : 'Trabajador',
            item.isActive ? 'Activo' : 'Inactivo',
            <span className="actions" key="actions">
              <button onClick={() => setEditing(item)}>Editar</button>
              {item.isActive && <button className="danger-text" onClick={() => deactivate(item.id)}>Desactivar</button>}
            </span>
          ])}
        />
      </section>
    </section>
  );
}

function UserForm({ initial, stores = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    password: '',
    confirmPassword: '',
    role: initial.role || 'employee',
    store_id: initial.storeId || stores[0]?.id || '',
    is_active: initial.isActive ?? true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const isNewUser = !initial.id;

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function submit(event) {
    event.preventDefault();
    setMessage('');

    // Validar que las contrasenas coincidan
    if (form.password && form.password !== form.confirmPassword) {
      setMessage('Las contrasenas no coinciden.');
      return;
    }

    // Validar longitud minima de contrasena para nuevos usuarios
    if (isNewUser && form.password && form.password.length < 6) {
      setMessage('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      store_id: form.store_id ? Number(form.store_id) : undefined,
      is_active: form.is_active
    };
    if (form.password) payload.password = form.password;
    onSubmit(payload);
  }

  return (
    <form className="form-grid panel" onSubmit={submit} aria-labelledby="user-title">
      <h2 id="user-title">{initial.id ? 'Editar usuario' : 'Registrar trabajador'}</h2>
      <label>Nombre<input name="name" value={form.name} onChange={update} required maxLength={120} /></label>
      <label>Correo<input name="email" value={form.email} onChange={update} type="email" required maxLength={160} /></label>
      <label>Tienda<select name="store_id" value={form.store_id} onChange={update} required><option value="">Seleccionar</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label>
      <label className="password-field">
        Contrasena
        <div className="password-input-wrapper">
          <input name="password" value={form.password} onChange={update} type={showPassword ? 'text' : 'password'} minLength={6} required={isNewUser} placeholder={initial.id ? 'Dejar vacia para conservar' : ''} />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      <label className="password-field">
        Confirmar contrasena
        <div className="password-input-wrapper">
          <input name="confirmPassword" value={form.confirmPassword} onChange={update} type={showConfirmPassword ? 'text' : 'password'} minLength={6} placeholder="Repite la contrasena" />
          <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      <label>Rol<select name="role" value={form.role} onChange={update}><option value="employee">Trabajador</option><option value="admin">Manager</option></select></label>
      <label className="check-row"><input name="is_active" checked={form.is_active} onChange={update} type="checkbox" /> Usuario activo</label>
      {message && <p className="error" style={{ gridColumn: '1 / -1' }}>{message}</p>}
      <div className="form-actions"><button type="button" onClick={onCancel}>Cancelar</button><button className="primary" type="submit">Guardar usuario</button></div>
    </form>
  );
}

function StockBadge({ product }) {
  const low = product.stock <= product.stock_min;
  return <span className={low ? 'badge warn' : 'badge'}>{product.stock}</span>;
}

function PageHeader({ title, subtitle, children }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions">{children}</div></header>;
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

createRoot(document.getElementById('root')).render(<App />);
