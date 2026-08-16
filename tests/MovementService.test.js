const assert = require("node:assert/strict");
const { afterEach, beforeEach, describe, test } = require("node:test");
const { mkdtemp, rm } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const InventoryRepository = require("../src/repositories/InventoryRepository");
const MovementService = require("../src/services/MovementService");
const ProductService = require("../src/services/ProductService");

const productData = {
  sku: "MOV-001",
  name: "Producto con movimientos",
  description: "Producto usado para probar entradas y salidas.",
  category: "Pruebas",
  quantity: 10,
  minStock: 3,
  unitPrice: 50000
};

describe("MovementService", () => {
  let temporaryDirectory;
  let movementService;
  let productService;
  let product;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "stockflow-movement-"));
    const repository = new InventoryRepository(path.join(temporaryDirectory, "inventory.json"));
    await repository.init();
    productService = new ProductService(repository);
    movementService = new MovementService(repository, productService);
    product = await productService.create(productData);
  });

  afterEach(async () => {
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  test("registra una entrada y aumenta las existencias", async () => {
    const result = await movementService.create(product.id, {
      type: "entry",
      quantity: 5,
      note: "Entrada de prueba"
    });

    assert.equal(result.movement.previousQuantity, 10);
    assert.equal(result.movement.currentQuantity, 15);
    assert.equal(result.product.quantity, 15);
  });

  test("registra una salida y conserva el historial", async () => {
    await movementService.create(product.id, { type: "exit", quantity: 4 });
    const movements = await movementService.listByProduct(product.id);

    assert.equal(movements.length, 1);
    assert.equal(movements[0].type, "exit");
    assert.equal((await productService.getById(product.id)).quantity, 6);
  });

  test("rechaza una salida mayor que las existencias sin cambiar el saldo", async () => {
    await assert.rejects(
      () => movementService.create(product.id, { type: "exit", quantity: 11 }),
      (error) => error.statusCode === 409 && error.code === "INSUFFICIENT_STOCK"
    );

    assert.equal((await productService.getById(product.id)).quantity, 10);
    assert.equal((await movementService.list()).length, 0);
  });

  test("valida tipo, cantidad y observación", async () => {
    await assert.rejects(
      () => movementService.create(product.id, { type: "transfer", quantity: 0, note: "x".repeat(161) }),
      (error) => error.statusCode === 422 && error.details.length === 3
    );
  });

  test("filtra movimientos por tipo", async () => {
    await movementService.create(product.id, { type: "entry", quantity: 2 });
    await movementService.create(product.id, { type: "exit", quantity: 1 });
    const entries = await movementService.list({ type: "entry" });

    assert.equal(entries.length, 1);
    assert.equal(entries[0].type, "entry");
  });
});
