import { useEffect, useState } from 'react';
import { MapPinned, Plus } from 'lucide-react';
import { api } from '../api/client.js';

function PageHeader({ title, subtitle, children }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions">{children}</div></header>;
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

export default function Stores() {
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