import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { canAccessStore, requireAdmin, requireAuth } from './middleware.js';
import { db, nextId, publicProduct } from './store.js';
import { config } from './config.js';
import { loginLimiter } from './security.js';

export const router = Router();

router.post('/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((item) => item.email === email && item.isActive);

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const store = db.stores.find((item) => item.id === user.storeId);
  const payload = { id: user.id, storeId: user.storeId, storeName: store?.name || null, name: user.name, email: user.email, role: user.role, photoUrl: user.photoUrl || null };
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });

  return res.json({ token, user: payload });
});

router.use(requireAuth);

router.get('/me', (req, res) => {
  const user = db.users.find((item) => item.id === req.user.id && item.isActive);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  const store = db.stores.find((item) => item.id === user.storeId);

  res.json({
    id: user.id,
    storeId: user.storeId,
    storeName: store?.name || null,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl || null
  });
});

router.put('/me', async (req, res) => {
  const user = db.users.find((item) => item.id === req.user.id && item.isActive);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const { name, email, password, photo_url } = req.body;

  if (email && db.users.some((item) => item.id !== user.id && item.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ message: 'Correo ya registrado' });
  }

  if (password !== undefined && password !== '' && String(password).length < 6) {
    return res.status(400).json({ message: 'La contrasena debe tener al menos 6 caracteres' });
  }

  if (photo_url && (!String(photo_url).startsWith('data:image/') || String(photo_url).length > 750000)) {
    return res.status(400).json({ message: 'Fotografia invalida o demasiado grande' });
  }

  if (name !== undefined) user.name = String(name).trim();
  if (email !== undefined) user.email = String(email).trim().toLowerCase();
  if (password) user.passwordHash = await bcrypt.hash(password, 12);
  if (photo_url !== undefined) user.photoUrl = photo_url || null;

  const store = db.stores.find((item) => item.id === user.storeId);
  res.json({
    id: user.id,
    storeId: user.storeId,
    storeName: store?.name || null,
    name: user.name,
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl || null
  });
});

router.get('/dashboard', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const visibleProducts = db.products.filter((product) => canAccessStore(req, product.storeId));
  const todaySales = db.sales.filter((sale) => canAccessStore(req, sale.storeId) && sale.createdAt.slice(0, 10) === today);
  const totalToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = visibleProducts.filter((product) => product.isActive && product.stock <= product.stockMin);
  const inventoryValue = visibleProducts.reduce((sum, product) => sum + product.stock * product.cost, 0);

  const recentMovements = db.inventoryMovements
    .slice()
    .reverse()
    .filter((movement) => {
      const product = db.products.find((item) => item.id === movement.productId);
      return product && canAccessStore(req, product.storeId);
    })
    .slice(0, 6)
    .map((movement) => ({
      ...movement,
      product: db.products.find((product) => product.id === movement.productId)?.name || 'Producto eliminado'
    }));

  res.json({
    total_sales_today: totalToday,
    orders_today: todaySales.length,
    low_stock_count: lowStock.length,
    inventory_value: inventoryValue,
    recent_movements: recentMovements
  });
});

router.get('/categories', (_req, res) => {
  res.json(db.categories);
});

router.get('/stores', requireAdmin, (_req, res) => {
  res.json(db.stores);
});

router.post('/stores', requireAdmin, (req, res) => {
  const { name, code, address, phone, latitude, longitude } = req.body;

  if (!name || !code || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Nombre, codigo, latitud y longitud son obligatorios' });
  }

  if (db.stores.some((store) => store.code.toLowerCase() === String(code).toLowerCase())) {
    return res.status(409).json({ message: 'Codigo de tienda duplicado' });
  }

  const store = {
    id: nextId(db.stores),
    name: String(name).trim(),
    code: String(code).trim().toUpperCase(),
    address: address || '',
    phone: phone || '',
    latitude: Number(latitude),
    longitude: Number(longitude),
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.stores.push(store);
  res.status(201).json(store);
});

router.put('/stores/:id', requireAdmin, (req, res) => {
  const store = db.stores.find((item) => item.id === Number(req.params.id));
  if (!store) return res.status(404).json({ message: 'Tienda no encontrada' });

  const { name, code, address, phone, latitude, longitude, is_active } = req.body;
  if (name !== undefined) store.name = String(name).trim();
  if (code !== undefined) store.code = String(code).trim().toUpperCase();
  if (address !== undefined) store.address = address;
  if (phone !== undefined) store.phone = phone;
  if (latitude !== undefined) store.latitude = Number(latitude);
  if (longitude !== undefined) store.longitude = Number(longitude);
  if (is_active !== undefined) store.isActive = Boolean(is_active);

  res.json(store);
});

router.get('/products', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const filtered = db.products
    .filter((product) => canAccessStore(req, product.storeId))
    .filter((product) => product.isActive)
    .filter((product) => !q || product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q));
  const start = (page - 1) * limit;

  res.json({
    data: filtered.slice(start, start + limit).map(publicProduct),
    meta: { page, limit, total: filtered.length }
  });
});

router.post('/products', (req, res) => {
  const { name, sku, category_id, store_id, price, cost = 0, stock_min = 0 } = req.body;
  const storeId = req.user.role === 'admin' ? Number(store_id || req.user.storeId || 1) : Number(req.user.storeId);

  if (!name || !sku || Number(price) < 0) {
    return res.status(400).json({ message: 'Datos invalidos' });
  }

  if (!db.stores.some((store) => store.id === storeId && store.isActive)) {
    return res.status(400).json({ message: 'Tienda invalida' });
  }

  if (db.products.some((product) => product.storeId === storeId && product.sku.toLowerCase() === String(sku).toLowerCase())) {
    return res.status(409).json({ message: 'SKU duplicado' });
  }

  const product = {
    id: nextId(db.products),
    storeId,
    categoryId: category_id ? Number(category_id) : null,
    name: String(name).trim(),
    sku: String(sku).trim(),
    price: Number(price),
    cost: Number(cost),
    stock: 0,
    stockMin: Number(stock_min),
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.products.push(product);
  res.status(201).json(publicProduct(product));
});

router.put('/products/:id', (req, res) => {
  const product = db.products.find((item) => item.id === Number(req.params.id));
  if (!product || !product.isActive) return res.status(404).json({ message: 'Producto no encontrado' });
  if (!canAccessStore(req, product.storeId)) return res.status(403).json({ message: 'Permisos insuficientes' });

  const fields = req.body;
  if (fields.name !== undefined) product.name = String(fields.name).trim();
  if (fields.sku !== undefined) product.sku = String(fields.sku).trim();
  if (fields.category_id !== undefined) product.categoryId = fields.category_id ? Number(fields.category_id) : null;
  if (fields.price !== undefined) product.price = Number(fields.price);
  if (fields.cost !== undefined) product.cost = Number(fields.cost);
  if (fields.stock_min !== undefined) product.stockMin = Number(fields.stock_min);
  if (fields.is_active !== undefined) product.isActive = Boolean(fields.is_active);

  res.json(publicProduct(product));
});

router.delete('/products/:id', (req, res) => {
  const product = db.products.find((item) => item.id === Number(req.params.id));
  if (!product || !product.isActive) return res.status(404).json({ message: 'Producto no encontrado' });
  if (!canAccessStore(req, product.storeId)) return res.status(403).json({ message: 'Permisos insuficientes' });
  product.isActive = false;
  res.status(204).send();
});

router.get('/inventory/movements', (_req, res) => {
  const data = db.inventoryMovements.slice().reverse().filter((movement) => {
    const product = db.products.find((item) => item.id === movement.productId);
    return product && canAccessStore(req, product.storeId);
  }).map((movement) => ({
    ...movement,
    product: db.products.find((product) => product.id === movement.productId)?.name || 'Producto eliminado'
  }));
  res.json(data);
});

router.post('/inventory/movements', (req, res) => {
  const { product_id, type, quantity, reason } = req.body;
  const product = db.products.find((item) => item.id === Number(product_id) && item.isActive);
  const numericQuantity = Number(quantity);

  if (!product || !canAccessStore(req, product.storeId) || !['IN', 'OUT', 'ADJUSTMENT'].includes(type) || numericQuantity <= 0) {
    return res.status(400).json({ message: 'Datos invalidos' });
  }

  const nextStock = type === 'IN' ? product.stock + numericQuantity : product.stock - numericQuantity;
  if (nextStock < 0) return res.status(400).json({ message: 'Stock insuficiente' });

  product.stock = nextStock;
  const movement = {
    id: nextId(db.inventoryMovements),
    productId: product.id,
    userId: req.user.id,
    type,
    quantity: numericQuantity,
    reason: reason || null,
    createdAt: new Date().toISOString()
  };
  db.inventoryMovements.push(movement);

  res.status(201).json({ ...movement, new_stock: product.stock });
});

router.get('/sales', (_req, res) => {
  res.json(db.sales.filter((sale) => canAccessStore(req, sale.storeId)).slice().reverse());
});

router.post('/sales', (req, res) => {
  const { items = [], payment_method = 'cash' } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Venta sin productos' });

  const resolved = [];
  for (const item of items) {
    const product = db.products.find((entry) => entry.id === Number(item.product_id) && entry.isActive && canAccessStore(req, entry.storeId));
    const quantity = Number(item.quantity);
    if (!product || quantity <= 0 || product.stock < quantity) {
      return res.status(400).json({ message: `Stock insuficiente para ${product?.name || 'producto'}` });
    }
    resolved.push({ product, quantity, unitPrice: Number(item.unit_price || product.price) });
  }

  const sale = {
    id: nextId(db.sales),
    storeId: resolved[0].product.storeId,
    userId: req.user.id,
    total: resolved.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    paymentMethod: payment_method,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  db.sales.push(sale);

  for (const item of resolved) {
    item.product.stock -= item.quantity;
    db.saleItems.push({
      id: nextId(db.saleItems),
      saleId: sale.id,
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice
    });
    db.inventoryMovements.push({
      id: nextId(db.inventoryMovements),
      productId: item.product.id,
      userId: req.user.id,
      type: 'OUT',
      quantity: item.quantity,
      reason: `Venta #${sale.id}`,
      createdAt: sale.createdAt
    });
  }

  res.status(201).json(sale);
});

router.get('/reports/low-stock', (_req, res) => {
  res.json(db.products.filter((product) => canAccessStore(req, product.storeId) && product.isActive && product.stock <= product.stockMin).map(publicProduct));
});

router.get('/reports/sales', (req, res) => {
  const from = req.query.date_from ? new Date(String(req.query.date_from)) : null;
  const to = req.query.date_to ? new Date(String(req.query.date_to)) : null;
  const sales = db.sales.filter((sale) => {
    const date = new Date(sale.createdAt);
    return canAccessStore(req, sale.storeId) && (!from || date >= from) && (!to || date <= to);
  });

  res.json({
    total_sales: sales.reduce((sum, sale) => sum + sale.total, 0),
    orders: sales.length,
    items_sold: db.saleItems
      .filter((item) => sales.some((sale) => sale.id === item.saleId))
      .reduce((sum, item) => sum + item.quantity, 0)
  });
});

router.get('/reports/export.csv', (req, res) => {
  const type = req.query.type || 'products';
  let rows = [];

  if (type === 'products') {
    rows = [['sku', 'name', 'price', 'stock'], ...db.products.filter((p) => canAccessStore(req, p.storeId) && p.isActive).map((p) => [p.sku, p.name, p.price, p.stock])];
  } else if (type === 'sales') {
    rows = [['id', 'total', 'payment_method', 'created_at'], ...db.sales.filter((sale) => canAccessStore(req, sale.storeId)).map((sale) => [sale.id, sale.total, sale.paymentMethod, sale.createdAt])];
  } else {
    return res.status(400).json({ message: 'Tipo de reporte invalido' });
  }

  res.header('Content-Type', 'text/csv');
  res.attachment(`${type}.csv`);
  res.send(rows.map((row) => row.join(',')).join('\n'));
});

router.get('/users', requireAdmin, (_req, res) => {
  res.json(db.users.map(({ passwordHash, ...user }) => ({
    ...user,
    store: db.stores.find((store) => store.id === user.storeId)?.name || null
  })));
});

router.post('/users', requireAdmin, async (req, res) => {
  const { name, email, password, role = 'employee', store_id } = req.body;
  const storeId = Number(store_id || req.user.storeId || 1);

  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Nombre, correo y contrasena de al menos 6 caracteres son obligatorios' });
  }

  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Rol invalido' });
  }

  if (!db.stores.some((store) => store.id === storeId && store.isActive)) {
    return res.status(400).json({ message: 'Tienda invalida' });
  }

  if (db.users.some((user) => user.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ message: 'Correo ya registrado' });
  }

  const user = {
    id: nextId(db.users),
    storeId,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role,
    photoUrl: null,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.users.push(user);

  const { passwordHash, ...publicUser } = user;
  res.status(201).json(publicUser);
});

router.put('/users/:id', requireAdmin, async (req, res) => {
  const user = db.users.find((item) => item.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const { name, email, password, role, store_id, is_active } = req.body;

  if (email && db.users.some((item) => item.id !== user.id && item.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ message: 'Correo ya registrado' });
  }

  if (role && !['admin', 'employee'].includes(role)) {
    return res.status(400).json({ message: 'Rol invalido' });
  }

  if (store_id && !db.stores.some((store) => store.id === Number(store_id) && store.isActive)) {
    return res.status(400).json({ message: 'Tienda invalida' });
  }

  if (name !== undefined) user.name = String(name).trim();
  if (email !== undefined) user.email = String(email).trim().toLowerCase();
  if (role !== undefined) user.role = role;
  if (store_id !== undefined) user.storeId = Number(store_id);
  if (is_active !== undefined) user.isActive = Boolean(is_active);
  if (password) user.passwordHash = await bcrypt.hash(password, 12);

  const { passwordHash, ...publicUser } = user;
  res.json(publicUser);
});

router.delete('/users/:id', requireAdmin, (req, res) => {
  const user = db.users.find((item) => item.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  if (user.id === req.user.id) return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });

  user.isActive = false;
  res.status(204).send();
});
