import React from 'react';

export default function NavButton({ icon, label, active, onClick }) {
  return <button className={active ? 'nav active' : 'nav'} onClick={onClick}>{React.cloneElement(icon, { size: 18 })}<span>{label}</span></button>;
}