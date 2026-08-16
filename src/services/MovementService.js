const { randomUUID } = require("node:crypto");
const AppError = require("../utils/AppError");

/** Gestiona entradas y salidas y protege el inventario contra saldos negativos. */
class MovementService {
  constructor(inventoryRepository, productService) {
    this.inventoryRepository = inventoryRepository;
    this.productService = productService;
  }

  async list(filters = {}) {
    const movements = await this.inventoryRepository.findAllMovements();
    const productId = String(filters.productId ?? "").trim();
    const type = String(filters.type ?? "").trim().toLowerCase();
    const from = this.parseOptionalDate(filters.from, "from");
    const to = this.parseOptionalDate(filters.to, "to");

    if (type && !["entry", "exit"].includes(type)) {
      throw new AppError("El tipo de movimiento debe ser entry o exit.", 422, null, "INVALID_FILTER");
    }

    return movements
      .filter((movement) => {
        const createdAt = new Date(movement.createdAt).getTime();
        return (
          (!productId || movement.productId === productId) &&
          (!type || movement.type === type) &&
          (!from || createdAt >= from.getTime()) &&
          (!to || createdAt <= to.getTime())
        );
      })
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  }

  async listByProduct(productId, filters = {}) {
    await this.productService.getById(productId);
    return this.list({ ...filters, productId });
  }

  async create(productId, payload = {}) {
    const type = String(payload.type ?? "").trim().toLowerCase();
    const quantity = Number(payload.quantity);
    const note = String(payload.note ?? "").trim();
    const errors = [];

    if (!["entry", "exit"].includes(type)) {
      errors.push("El tipo debe ser entry (entrada) o exit (salida).");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push("La cantidad debe ser un número entero mayor que cero.");
    }

    if (note.length > 160) {
      errors.push("La observación no puede superar 160 caracteres.");
    }

    if (errors.length > 0) {
      throw new AppError("Revise la información del movimiento.", 422, errors, "VALIDATION_ERROR");
    }

    const movementData = {
      id: randomUUID(),
      type,
      quantity,
      note,
      createdAt: new Date().toISOString()
    };
    const result = await this.inventoryRepository.registerMovement(productId, movementData);

    if (result.status === "not_found") {
      throw new AppError("El producto solicitado no existe.", 404, null, "PRODUCT_NOT_FOUND");
    }

    if (result.status === "insufficient") {
      throw new AppError(
        "No hay existencias suficientes para registrar la salida.",
        409,
        { availableQuantity: result.availableQuantity, requestedQuantity: quantity },
        "INSUFFICIENT_STOCK"
      );
    }

    return {
      movement: result.movement,
      product: this.productService.decorate(result.product)
    };
  }

  parseOptionalDate(value, fieldName) {
    if (value === undefined || value === "") {
      return null;
    }

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      throw new AppError(`El filtro ${fieldName} debe ser una fecha válida.`, 422, null, "INVALID_FILTER");
    }

    return date;
  }
}

module.exports = MovementService;
