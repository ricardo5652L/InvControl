import { useEffect, useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { api, API_URL } from '../api/client.js';
import { formatCurrency } from '../utils.js';

function PageHeader({ title, subtitle, children }) {
  return <header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions">{children}</div></header>;
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

export default function Reports() {
  const [lowStock, setLowStock] = useState([]);
  const [sales, setSales] = useState(null);

  useEffect(() => {
    Promise.all([api('/reports/low-stock'), api('/reports/sales')]).then(([low, salesReport]) => {
      setLowStock(low);
      setSales(salesReport);
    });
  }, []);

  async function download(type) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}reports/export.csv?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <PageHeader title="Reportes" subtitle="Indicadores exportables">
        <button onClick={() => download('products')}><Download size={18} /> CSV productos</button>
      </PageHeader>
      <div className="kpis">
        <Kpi label="Ventas totales" value={currency(sales?.total_sales)} />
        <Kpi label="Ordenes" value={sales?.orders || 0} />
        <Kpi label="Articulos vendidos" value={sales?.items_sold || 0} />
      </div>
      <section className="panel">
        <h2><AlertTriangle size={18} /> Stock bajo</h2>
        <DataTable columns={['SKU', 'Producto', 'Stock', 'Minimo']} rows={lowStock.map((product) => [product.sku, product.name, product.stock, product.stock_min])} />
      </section>
    </section>
  );
}