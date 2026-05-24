import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalido' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Permisos insuficientes' });
  }
  return next();
}

export function canAccessStore(req, storeId) {
  return req.user?.role === 'admin' || Number(req.user?.storeId) === Number(storeId);
}
