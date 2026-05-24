import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

async function token() {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@invcontrol.local', password: 'admin123' });
  return response.body.token;
}

test('health responds ok', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
});

test('creates product with auth', async () => {
  const auth = await token();
  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${auth}`)
    .send({ name: 'Cafe soluble', sku: `CAF-${Date.now()}`, price: 82.5, cost: 62, stock_min: 3 });

  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Cafe soluble');
});

test('admin creates employee user', async () => {
  const auth = await token();
  const response = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${auth}`)
    .send({
      name: 'Trabajador Demo',
      email: `trabajador-${Date.now()}@invcontrol.local`,
      password: 'empleado123',
      role: 'employee'
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.role, 'employee');
});

test('employee cannot list users', async () => {
  const adminToken = await token();
  const email = `empleado-${Date.now()}@invcontrol.local`;

  await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Empleado sin permisos', email, password: 'empleado123', role: 'employee' });

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'empleado123' });

  const response = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${login.body.token}`);

  assert.equal(response.status, 403);
});

test('employee updates only own profile fields', async () => {
  const adminToken = await token();
  const email = `perfil-${Date.now()}@invcontrol.local`;

  await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Empleado Perfil', email, password: 'empleado123', role: 'employee' });

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'empleado123' });

  const response = await request(app)
    .put('/api/me')
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({
      name: 'Empleado Editado',
      email,
      role: 'admin',
      store_id: 999,
      photo_url: 'data:image/png;base64,aGVsbG8='
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'Empleado Editado');
  assert.equal(response.body.role, 'employee');
  assert.equal(response.body.storeId, 1);
});
