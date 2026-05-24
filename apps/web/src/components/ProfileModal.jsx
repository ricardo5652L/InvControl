import { useState } from 'react';
import { Camera, Eye, EyeOff, Store, UserRound, X } from 'lucide-react';
import { api } from '../api/client.js';
import { initials } from '../utils/initials.js';

export default function ProfileModal({ currentUser, theme, onThemeChange, onClose, onSaved }) {
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