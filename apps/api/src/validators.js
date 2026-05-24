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