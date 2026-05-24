/**
 * Validadores básicos para endpoints de Products.
 * Sin dependencias externas, validaciones simples y seguras.
 */

/**
 * Valida que un valor sea un string no vacío.
 * @param {*} value - Valor a validar
 * @returns {boolean} - True si es un string no vacío
 */
function isValidNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida que un valor sea un número válido (o string convertible a número).
 * @param {*} value - Valor a validar
 * @returns {boolean} - True si es un número válido
 */
function isValidNumber(value) {
  if (value === undefined || value === null) return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Valida que un valor sea un número no negativo.
 * @param {*} value - Valor a validar
 * @returns {boolean} - True si es un número no negativo
 */
function isNonNegativeNumber(value) {
  if (!isValidNumber(value)) return false;
  return Number(value) >= 0;
}

/**
 * Valida que un valor sea un número entero positivo o null.
 * @param {*} value - Valor a validar
 * @returns {boolean} - True si es un entero positivo o null válido
 */
function isValidOptionalPositiveInt(value) {
  if (value === undefined || value === null || value === '') return true;
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
}

/**
 * Valida el formato básico de un email.
 * @param {string} email - Email a validar
 * @returns {boolean} - True si tiene formato válido
 */
function isValidEmail(email) {
  if (typeof email !== 'string' || email.trim().length === 0) return false;
  // Validación básica: debe tener @ y un dominio después
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida los datos requeridos para crear un producto (POST /api/products).
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateCreateProduct(body) {
  const errors = [];

  // name obligatorio - debe ser string no vacío
  if (!body.name || !isValidNonEmptyString(body.name)) {
    errors.push('El nombre es obligatorio y debe ser un texto no vacío');
  }

  // sku obligatorio - debe ser string no vacío
  if (!body.sku || !isValidNonEmptyString(body.sku)) {
    errors.push('El SKU es obligatorio y debe ser un texto no vacío');
  }

  // price obligatorio - debe ser número no negativo
  if (!isValidNumber(body.price)) {
    errors.push('El precio es obligatorio y debe ser un número válido');
  } else if (Number(body.price) < 0) {
    errors.push('El precio no puede ser negativo');
  }

  // cost opcional - si viene, debe ser número no negativo
  if (body.cost !== undefined && body.cost !== null && body.cost !== '') {
    if (!isValidNumber(body.cost)) {
      errors.push('El costo debe ser un número válido');
    } else if (Number(body.cost) < 0) {
      errors.push('El costo no puede ser negativo');
    }
  }

  // stock_min opcional - si viene, debe ser número no negativo
  if (body.stock_min !== undefined && body.stock_min !== null && body.stock_min !== '') {
    if (!isValidNumber(body.stock_min)) {
      errors.push('El stock mínimo debe ser un número válido');
    } else if (Number(body.stock_min) < 0) {
      errors.push('El stock mínimo no puede ser negativo');
    }
  }

  // category_id opcional - si viene, debe ser número válido
  if (body.category_id !== undefined && body.category_id !== null && body.category_id !== '') {
    if (!isValidOptionalPositiveInt(body.category_id)) {
      errors.push('La categoría debe ser un número entero válido');
    }
  }

  // store_id opcional - si viene, debe ser número válido
  if (body.store_id !== undefined && body.store_id !== null && body.store_id !== '') {
    if (!isValidOptionalPositiveInt(body.store_id)) {
      errors.push('La tienda debe ser un número entero válido');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos para actualizar un producto (PUT /api/products/:id).
 * Solo valida los campos que vienen en el body, no requiere todos.
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateUpdateProduct(body) {
  const errors = [];

  // Si viene name, debe ser string no vacío
  if (body.name !== undefined) {
    if (!isValidNonEmptyString(body.name)) {
      errors.push('El nombre debe ser un texto no vacío');
    }
  }

  // Si viene sku, debe ser string no vacío
  if (body.sku !== undefined) {
    if (!isValidNonEmptyString(body.sku)) {
      errors.push('El SKU debe ser un texto no vacío');
    }
  }

  // Si viene price, debe ser número no negativo
  if (body.price !== undefined) {
    if (!isValidNumber(body.price)) {
      errors.push('El precio debe ser un número válido');
    } else if (Number(body.price) < 0) {
      errors.push('El precio no puede ser negativo');
    }
  }

  // Si viene cost, debe ser número no negativo
  if (body.cost !== undefined) {
    if (!isValidNumber(body.cost)) {
      errors.push('El costo debe ser un número válido');
    } else if (Number(body.cost) < 0) {
      errors.push('El costo no puede ser negativo');
    }
  }

  // Si viene stock_min, debe ser número no negativo
  if (body.stock_min !== undefined) {
    if (!isValidNumber(body.stock_min)) {
      errors.push('El stock mínimo debe ser un número válido');
    } else if (Number(body.stock_min) < 0) {
      errors.push('El stock mínimo no puede ser negativo');
    }
  }

  // Si viene category_id, debe ser número válido o null
  if (body.category_id !== undefined) {
    if (body.category_id !== null && body.category_id !== '' && !isValidOptionalPositiveInt(body.category_id)) {
      errors.push('La categoría debe ser un número entero válido o null');
    }
  }

  // Si viene is_active, se convierte a boolean (ya funciona en el código actual)
  // No requiere validación especial ya que Boolean() maneja cualquier valor

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos requeridos para crear un usuario (POST /api/users).
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateCreateUser(body) {
  const errors = [];

  // name obligatorio - debe ser string no vacío
  if (!body.name || !isValidNonEmptyString(body.name)) {
    errors.push('El nombre es obligatorio y debe ser un texto no vacío');
  }

  // email obligatorio - debe tener formato válido
  if (!body.email || !isValidEmail(body.email)) {
    errors.push('El correo es obligatorio y debe tener un formato válido');
  }

  // password obligatorio - debe tener mínimo 6 caracteres
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.push('La contraseña es obligatoria y debe tener al menos 6 caracteres');
  }

  // role opcional - solo puede ser admin o employee
  if (body.role !== undefined && body.role !== null && body.role !== '') {
    if (!['admin', 'employee'].includes(body.role)) {
      errors.push('El rol solo puede ser admin o employee');
    }
  }

  // store_id opcional - si viene, debe ser número entero positivo
  if (body.store_id !== undefined && body.store_id !== null && body.store_id !== '') {
    if (!isValidOptionalPositiveInt(body.store_id)) {
      errors.push('La tienda debe ser un número entero válido');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos para actualizar un usuario (PUT /api/users/:id).
 * Solo valida los campos que vienen en el body, no requiere todos.
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateUpdateUser(body) {
  const errors = [];

  // Si viene name, debe ser string no vacío
  if (body.name !== undefined) {
    if (!isValidNonEmptyString(body.name)) {
      errors.push('El nombre debe ser un texto no vacío');
    }
  }

  // Si viene email, debe tener formato válido
  if (body.email !== undefined) {
    if (!isValidEmail(body.email)) {
      errors.push('El correo debe tener un formato válido');
    }
  }

  // Si viene password, debe tener mínimo 6 caracteres
  if (body.password !== undefined && body.password !== null && body.password !== '') {
    if (typeof body.password !== 'string' || body.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }

  // Si viene role, solo puede ser admin o employee
  if (body.role !== undefined && body.role !== null && body.role !== '') {
    if (!['admin', 'employee'].includes(body.role)) {
      errors.push('El rol solo puede ser admin o employee');
    }
  }

  // Si viene store_id, debe ser número entero positivo
  if (body.store_id !== undefined && body.store_id !== null && body.store_id !== '') {
    if (!isValidOptionalPositiveInt(body.store_id)) {
      errors.push('La tienda debe ser un número entero válido');
    }
  }

  // Si viene is_active, se convierte a boolean (ya funciona en el código actual)
  // No requiere validación especial

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos para actualizar el perfil propio (PUT /api/me).
 * Solo valida los campos que vienen en el body, no requiere todos.
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateUpdateProfile(body) {
  const errors = [];

  // Si viene name, debe ser string no vacío
  if (body.name !== undefined) {
    if (!isValidNonEmptyString(body.name)) {
      errors.push('El nombre debe ser un texto no vacío');
    }
  }

  // Si viene email, debe tener formato válido
  if (body.email !== undefined) {
    if (!isValidEmail(body.email)) {
      errors.push('El correo debe tener un formato válido');
    }
  }

  // Si viene password, debe tener mínimo 6 caracteres cuando no esté vacío
  if (body.password !== undefined && body.password !== null && body.password !== '') {
    if (typeof body.password !== 'string' || body.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }

  // Si viene photo_url, mantener la lógica actual:
  // - debe iniciar con data:image/
  // - no debe exceder 750000 caracteres
  if (body.photo_url !== undefined && body.photo_url !== null && body.photo_url !== '') {
    if (typeof body.photo_url !== 'string' || !body.photo_url.startsWith('data:image/')) {
      errors.push('La fotografía debe ser una URL de imagen válida en base64');
    } else if (body.photo_url.length > 750000) {
      errors.push('La fotografía es demasiado grande');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos para crear un movimiento de inventario (POST /api/inventory/movements).
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateInventoryMovement(body) {
  const errors = [];

  // product_id obligatorio - debe ser número entero positivo
  if (body.product_id === undefined || body.product_id === null || body.product_id === '') {
    errors.push('El ID del producto es obligatorio');
  } else if (!isValidOptionalPositiveInt(body.product_id)) {
    errors.push('El ID del producto debe ser un número entero válido');
  }

  // type obligatorio - solo puede ser IN, OUT o ADJUSTMENT
  if (!body.type || !['IN', 'OUT', 'ADJUSTMENT'].includes(body.type)) {
    errors.push('El tipo de movimiento es obligatorio y debe ser IN, OUT o ADJUSTMENT');
  }

  // quantity obligatorio - debe ser número positivo
  if (body.quantity === undefined || body.quantity === null || body.quantity === '') {
    errors.push('La cantidad es obligatoria');
  } else if (!isValidNumber(body.quantity)) {
    errors.push('La cantidad debe ser un número válido');
  } else if (Number(body.quantity) <= 0) {
    errors.push('La cantidad debe ser mayor a cero');
  }

  // reason opcional - si viene, debe ser string
  if (body.reason !== undefined && body.reason !== null && body.reason !== '') {
    if (typeof body.reason !== 'string') {
      errors.push('El motivo debe ser un texto');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida los datos para crear una venta (POST /api/sales).
 * @param {Object} body - Cuerpo de la solicitud
 * @returns {{ valid: boolean, errors: string[] }} - Resultado de la validación
 */
export function validateCreateSale(body) {
  const errors = [];

  // items obligatorio - debe ser arreglo
  if (!Array.isArray(body.items)) {
    errors.push('Los items de la venta deben ser un arreglo');
    return { valid: false, errors };
  }

  // items debe tener al menos un producto
  if (body.items.length === 0) {
    errors.push('La venta debe tener al menos un producto');
    return { valid: false, errors };
  }

  // Validar cada item
  for (let i = 0; i < body.items.length; i++) {
    const item = body.items[i];
    const prefix = `El item ${i + 1}:`;

    // product_id obligatorio en cada item
    if (item.product_id === undefined || item.product_id === null || item.product_id === '') {
      errors.push(`${prefix} el ID del producto es obligatorio`);
    } else if (!isValidOptionalPositiveInt(item.product_id)) {
      errors.push(`${prefix} el ID del producto debe ser un número entero válido`);
    }

    // quantity obligatorio en cada item
    if (item.quantity === undefined || item.quantity === null || item.quantity === '') {
      errors.push(`${prefix} la cantidad es obligatoria`);
    } else if (!isValidNumber(item.quantity)) {
      errors.push(`${prefix} la cantidad debe ser un número válido`);
    } else if (Number(item.quantity) <= 0) {
      errors.push(`${prefix} la cantidad debe ser mayor a cero`);
    }

    // unit_price opcional - si viene, debe ser número no negativo
    if (item.unit_price !== undefined && item.unit_price !== null && item.unit_price !== '') {
      if (!isValidNumber(item.unit_price)) {
        errors.push(`${prefix} el precio unitario debe ser un número válido`);
      } else if (Number(item.unit_price) < 0) {
        errors.push(`${prefix} el precio unitario no puede ser negativo`);
      }
    }
  }

  // payment_method opcional - si viene, debe ser string no vacío
  if (body.payment_method !== undefined && body.payment_method !== null && body.payment_method !== '') {
    if (typeof body.payment_method !== 'string' || body.payment_method.trim().length === 0) {
      errors.push('El método de pago debe ser un texto');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
