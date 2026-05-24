import { useEffect, useState } from 'react';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { api } from '../api/client.js';

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

export default function Users() {
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