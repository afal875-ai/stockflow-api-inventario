const assert = require("node:assert/strict");
const { afterEach, beforeEach, describe, test } = require("node:test");
const { mkdtemp, rm } = require("node:fs/promises");
const { once } = require("node:events");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const createApp = require("../src/app");

const productData = {
  sku: "API-001",
  name: "Producto desde API",
  description: "Registro usado por la prueba de integración.",
  category: "Integración",
  quantity: 8,
  minStock: 2,
  unitPrice: 75000
};

describe("StockFlow API", () => {
  let temporaryDirectory;
  let server;
  let connection;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "stockflow-api-"));
    const app = await createApp({ dataFile: path.join(temporaryDirectory, "inventory.json") });
    if (process.platform === "win32") {
      server = app.listen(0, "127.0.0.1");
    } else {
      server = app.listen(path.join(temporaryDirectory, "stockflow.sock"));
    }
    await once(server, "listening");
    connection = process.platform === "win32"
      ? { hostname: "127.0.0.1", port: server.address().port }
      : { socketPath: server.address() };
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  async function requestApi(resource, options = {}) {
    const payload = options.body ? JSON.stringify(options.body) : null;
    const headers = payload
      ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
      : {};

    return new Promise((resolve, reject) => {
      const request = http.request({
        ...connection,
        path: `/api/v1${resource}`,
        method: options.method ?? "GET",
        headers
      }, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: text ? JSON.parse(text) : null
          });
        });
      });
      request.on("error", reject);

      if (payload) {
        request.write(payload);
      }

      request.end();
    });
  }

  async function createProduct(overrides = {}) {
    return requestApi("/products", {
      method: "POST",
      body: { ...productData, ...overrides }
    });
  }

  test("expone estado, documentación y cabecera de trazabilidad", async () => {
    const response = await requestApi("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "ok");
    assert.ok(response.headers["x-request-id"]);
  });

  test("crea, consulta y actualiza un producto", async () => {
    const created = await createProduct();
    assert.equal(created.status, 201);

    const patchResponse = await requestApi(`/products/${created.body.data.id}`, {
      method: "PATCH",
      body: { minStock: 9 }
    });

    assert.equal(patchResponse.status, 200);
    assert.equal(patchResponse.body.data.status, "low");
  });

  test("registra movimientos y rechaza salidas sin saldo", async () => {
    const created = await createProduct();
    const productId = created.body.data.id;
    const entryResponse = await requestApi(`/products/${productId}/movements`, {
      method: "POST",
      body: { type: "entry", quantity: 2 }
    });
    const conflictResponse = await requestApi(`/products/${productId}/movements`, {
      method: "POST",
      body: { type: "exit", quantity: 99 }
    });

    assert.equal(entryResponse.status, 201);
    assert.equal(conflictResponse.status, 409);
    assert.equal(conflictResponse.body.code, "INSUFFICIENT_STOCK");
  });

  test("retorna 409 para SKU duplicado y 404 para ruta inexistente", async () => {
    await createProduct();
    const duplicate = await createProduct({ name: "Producto duplicado" });
    const missingResponse = await requestApi("/recurso-inexistente");

    assert.equal(duplicate.status, 409);
    assert.equal(missingResponse.status, 404);
    assert.equal(missingResponse.body.code, "ROUTE_NOT_FOUND");
  });
});
