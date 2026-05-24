import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, Boxes, ClipboardPlus, EyeOff, LayoutDashboard, LogOut, MapPinned, PackagePlus, ShoppingCart, UsersRound } from 'lucide-react';
import './styles.css';
import logoUrl from './assets/invcontrol-logo.svg';
import { api } from './api/client.js';
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [view, setView] = useState('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || 'system');

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) setMobileMenuOpen(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    setMobileMenuOpen(false);
    localStorage.clear();
    setToken(null);
    setUser(null);
  }

  function selectView(nextView) {
    setMobileMenuOpen(false);
    setView(nextView);
  }

  function renderNavItems() {
    return (
      <>
        <NavButton icon={<LayoutDashboard />} label="Dashboard" active={view === 'dashboard'} onClick={() => selectView('dashboard')} />
        <NavButton icon={<ClipboardPlus />} label="Altas" active={view === 'quick'} onClick={() => selectView('quick')} />
        <NavButton icon={<Boxes />} label="Productos" active={view === 'products'} onClick={() => selectView('products')} />
        <NavButton icon={<PackagePlus />} label="Inventario" active={view === 'inventory'} onClick={() => selectView('inventory')} />
        <NavButton icon={<ShoppingCart />} label="Ventas" active={view === 'sales'} onClick={() => selectView('sales')} />
        <NavButton icon={<BarChart3 />} label="Reportes" active={view === 'reports'} onClick={() => selectView('reports')} />
        {user?.role === 'admin' && <NavButton icon={<MapPinned />} label="Tiendas" active={view === 'stores'} onClick={() => selectView('stores')} />}
        {user?.role === 'admin' && <NavButton icon={<UsersRound />} label="Usuarios" active={view === 'users'} onClick={() => selectView('users')} />}
      </>
    );
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
          {renderNavItems()}
        </nav>
      </aside>

      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        className={mobileMenuOpen ? 'mobile-drawer open' : 'mobile-drawer'}
        aria-label="Menú móvil"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-drawer-top">
          <img className="mobile-brand" src={logoUrl} alt="InvControl" />
          <button type="button" className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">
            ×
          </button>
        </div>
        <div className="mobile-drawer-items">
          {renderNavItems()}
        </div>
      </nav>

      <main className="content">
        <div className="topbar topbar-desktop">
          <ProfileBubble user={user} onOpen={() => setProfileOpen(true)} />
        </div>

        <div className="topbar topbar-mobile" role="banner" aria-label="Topbar móvil">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Abrir menú"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>
          <div className="mobile-brand-title">
            <img className="mobile-brand" src={logoUrl} alt="InvControl" />
            <span>InvControl</span>
          </div>
          <div className="mobile-profile">
            <ProfileBubble user={user} onOpen={() => setProfileOpen(true)} />
          </div>
        </div>

        <div className="page-view" key={view}>
          {view === 'dashboard' && <Dashboard />}
          {view === 'quick' && <QuickCreate setView={setView} isAdmin={user?.role === 'admin'} />}
          {view === 'products' && <Products />}
          {view === 'inventory' && <Inventory />}
          {view === 'sales' && <Sales />}
          {view === 'reports' && <Reports />}
          {view === 'stores' && user?.role === 'admin' && <Stores />}
          {view === 'users' && user?.role === 'admin' && <Users />}
        </div>
      </main>
      {profileOpen && (
        <ProfileModal
          currentUser={user}
          theme={theme}
          onThemeChange={setTheme}
          onClose={() => setProfileOpen(false)}
          onSaved={updateUser}
          onLogout={logout}
        />
      )}
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