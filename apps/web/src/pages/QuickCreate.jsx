import React from 'react';
import { Boxes, PackagePlus, ShoppingCart, Store, UsersRound } from 'lucide-react';

function PageHeader({ title, subtitle, children }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions">{children}</div></header>;
}

export default function QuickCreate({ setView, isAdmin }) {
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