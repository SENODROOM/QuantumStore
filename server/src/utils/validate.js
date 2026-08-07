const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProductPayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    if (!body.name || String(body.name).trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    } else {
      data.name = String(body.name).trim();
    }
  }

  if (!partial || body.description !== undefined) {
    if (!body.description || String(body.description).trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    } else {
      data.description = String(body.description).trim();
    }
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      errors.push('Price must be a number greater than or equal to 0');
    } else {
      data.price = price;
    }
  }

  if (!partial || body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      errors.push('Stock must be a whole number greater than or equal to 0');
    } else {
      data.stock = stock;
    }
  }

  if (!partial || body.category !== undefined) {
    if (!body.category || String(body.category).trim().length < 2) {
      errors.push('Category is required');
    } else {
      data.category = String(body.category).trim();
    }
  }

  if (!partial || body.image !== undefined) {
    if (!body.image || String(body.image).trim().length < 5) {
      errors.push('Image URL or path is required');
    } else {
      data.image = String(body.image).trim();
    }
  }

  if (body.brand !== undefined) {
    data.brand = String(body.brand || 'Quantum').trim();
  }

  if (body.featured !== undefined) {
    data.featured = Boolean(body.featured);
  }

  return { errors, data };
}

export function validateOrderPayload(body) {
  const errors = [];

  if (!body.customerName || String(body.customerName).trim().length < 2) {
    errors.push('Customer name is required');
  }
  if (!body.email || !EMAIL_RE.test(String(body.email).trim())) {
    errors.push('A valid email is required');
  }
  if (!body.phone || String(body.phone).trim().length < 7) {
    errors.push('A valid phone number is required');
  }
  if (!body.address || String(body.address).trim().length < 8) {
    errors.push('Shipping address is required');
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('Order must include at least one item');
  } else {
    for (const item of body.items) {
      if (!item.productId) errors.push('Each item needs a productId');
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1) {
        errors.push('Each item quantity must be a whole number of at least 1');
      }
    }
  }

  return errors;
}

export { EMAIL_RE };
