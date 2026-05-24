import { initials } from '../utils/initials.js';

export default function ProfileBubble({ user, onOpen }) {
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