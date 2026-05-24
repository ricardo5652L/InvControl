import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, BarChart3, Boxes, ClipboardPlus, Download, EyeOff, LayoutDashboard, LogOut, MapPinned, PackagePlus, Plus, ReceiptText, Search, ShoppingCart, Store, UserRound, UsersRound } from 'lucide-react';
import './styles.css';
import { formatCurrency } from './utils.js';
import logoUrl from './assets/invcontrol-logo.svg';
import { api, API_URL } from './api/client.js';
import NavButton from './components/NavButton.jsx';
import ProfileBubble from './components/ProfileBubble.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Inventory from './pages/Inventory.jsx';
import Sales from './pages/Sales.jsx';
import Reports from './pages/Reports.jsx';
import Stores from './pages/Stores.jsx';

const THEME_KEY = 'invcontrol-theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme || 'system';
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
              {showPassword ? <EyeOff size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">Entrar</button>
      </form>
    </main>
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