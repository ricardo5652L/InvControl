import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formatCurrency } from '../utils.js';

function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}

function Kpi({ label, value, tone }) {
  return <article className={`kpi ${tone || ''}`}><small>{label}</small><strong>{value}</strong></article>;
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

function currency(value) {
  return formatCurrency(value);
}

export default function Dashboard() {
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