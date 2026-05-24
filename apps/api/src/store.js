import bcrypt from 'bcryptjs';

const now = () => new Date().toISOString();

export const db = {
  stores: [
    {
      id: 1,
      name: 'Sucursal Centro',
      code: 'CENTRO',
      address: 'Balancan, Tabasco, Mexico',
      phone: '9340000000',
      latitude: 17.8008,
      longitude: -91.5364,
      isActive: true,
      createdAt: now()
    }
  ],
  users: [
    {
      id: 1,
      storeId: 1,
      name: 'Administrador',
      email: 'admin@invcontrol.local',
      passwordHash: bcrypt.hashSync('admin123', 12),
      role: 'admin',
      photoUrl: null,
      isActive: true,
      createdAt: now()
    },
    {
      id: 2,
      storeId: 1,
      name: 'Trabajador Demo',
      email: 'trabajador@invcontrol.local',
      passwordHash: bcrypt.hashSync('trabajador123', 12),
      role: 'employee',
      photoUrl: null,
      isActive: true,
      createdAt: now()
    }
  ],
  categories: [
    { id: 1, name: 'Abarrotes' },
    { id: 2, name: 'Bebidas' },
    { id: 3, name: 'Limpieza' }
  ],
  products: [
    { id: 1, storeId: 1, categoryId: 1, name: 'Leche 1L', sku: 'LEC-001', price: 28.5, cost: 21, stock: 18, stockMin: 6, isActive: true, createdAt: now() },
    { id: 2, storeId: 1, categoryId: 2, name: 'Agua 600ml', sku: 'AGU-600', price: 12, cost: 7, stock: 4, stockMin: 10, isActive: true, createdAt: now() },
    { id: 3, storeId: 1, categoryId: 3, name: 'Detergente 500g', sku: 'DET-500', price: 35, cost: 24, stock: 11, stockMin: 5, isActive: true, createdAt: now() }
  ],
  inventoryMovements: [
    { id: 1, productId: 1, userId: 1, type: 'IN', quantity: 18, reason: 'Inventario inicial', createdAt: now() },
    { id: 2, productId: 2, userId: 1, type: 'IN', quantity: 4, reason: 'Inventario inicial', createdAt: now() }
  ],
  sales: [],
  saleItems: []
};

export function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

export function publicProduct(product) {
  return {
    id: product.id,
    store_id: product.storeId,
    category_id: product.categoryId,
    category: db.categories.find((category) => category.id === product.categoryId)?.name || null,
    name: product.name,
    sku: product.sku,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    stock_min: product.stockMin,
    is_active: product.isActive,
    created_at: product.createdAt
  };
}
