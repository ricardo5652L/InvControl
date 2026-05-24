import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para el endpoint de login.
 * Protege contra intentos repetidos de inicio de sesión.
 * 
 * Configuración:
 * - Ventana de tiempo: 15 minutos
 * - Máximo de intentos: 5 por IP
 * - Mensaje de respuesta en español
 * - Se puede desactivar en tests mediante SKIP_RATE_LIMIT=true
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos por IP
  message: { message: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
  standardHeaders: true, // Devuelve información de rate limit en headers Retry-After
  legacyHeaders: false, // Desactiva headers X-RateLimit-*
  skipSuccessfulRequests: false, // Cuenta tanto éxitos como fallos
  skip: () => process.env.SKIP_RATE_LIMIT === 'true', // Permite desactivar en tests
});
