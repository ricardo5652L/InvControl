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
import QuickCreate from './pages/QuickCreate.jsx';
import Users from './pages/Users.jsx';

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



createRoot(document.getElementById('root')).render(<App />);