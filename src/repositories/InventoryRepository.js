const { mkdir, readFile, rename, writeFile } = require("node:fs/promises");
const path = require("node:path");

/**
 * Persistencia JSON del inventario. Productos y movimientos se guardan en una
 * sola unidad para que un movimiento y su cambio de existencias sean atómicos.
 */
class InventoryRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this.operationQueue = Promise.resolve();
  }

  async init() {
    await mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await this.readStore();
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      await this.writeStore({ products: [], movements: [] });
    }
  }

  async findAllProducts() {
    const store = await this.readStore();
    return store.products;
  }

  async findProductById(id) {
    const products = await this.findAllProducts();
    return products.find((product) => product.id === id) ?? null;
  }

  async createProduct(product) {
    return this.enqueue(async () => {
      const store = await this.readStore();
      store.products.push(product);
      await this.writeStore(store);
      return product;
    });
  }

  async updateProduct(id, changes) {
    return this.enqueue(async () => {
      const store = await this.readStore();
      const index = store.products.findIndex((product) => product.id === id);

      if (index === -1) {
        return null;
      }

      store.products[index] = { ...store.products[index], ...changes };
      await this.writeStore(store);
      return store.products[index];
    });
  }

  async deleteProduct(id) {
    return this.enqueue(async () => {
      const store = await this.readStore();
      const index = store.products.findIndex((product) => product.id === id);

      if (index === -1) {
        return false;
      }

      store.products.splice(index, 1);
      await this.writeStore(store);
      return true;
    });
  }

  async findAllMovements() {
    const store = await this.readStore();
    return store.movements;
  }

  async registerMovement(productId, movementData) {
    return this.enqueue(async () => {
      const store = await this.readStore();
      const index = store.products.findIndex((product) => product.id === productId);

      if (index === -1) {
        return { status: "not_found" };
      }

      const product = store.products[index];
      const delta = movementData.type === "entry" ? movementData.quantity : -movementData.quantity;
      const currentQuantity = product.quantity + delta;

      if (currentQuantity < 0) {
        return { status: "insufficient", availableQuantity: product.quantity };
      }

      const updatedProduct = {
        ...product,
        quantity: currentQuantity,
        updatedAt: movementData.createdAt
      };
      const movement = {
        ...movementData,
        productId,
        productSku: product.sku,
        productName: product.name,
        previousQuantity: product.quantity,
        currentQuantity
      };

      store.products[index] = updatedProduct;
      store.movements.push(movement);
      await this.writeStore(store);
      return { status: "ok", product: updatedProduct, movement };
    });
  }

  async readStore() {
    const content = await readFile(this.filePath, "utf8");
    const store = JSON.parse(content);

    if (!store || !Array.isArray(store.products) || !Array.isArray(store.movements)) {
      throw new Error("El archivo de inventario no contiene una estructura válida.");
    }

    return store;
  }

  async writeStore(store) {
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
  }

  enqueue(operation) {
    const result = this.operationQueue.then(operation);
    this.operationQueue = result.catch(() => undefined);
    return result;
  }
}

module.exports = InventoryRepository;
