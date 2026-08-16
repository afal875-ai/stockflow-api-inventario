const express = require("express");
const path = require("node:path");
const MovementController = require("./controllers/MovementController");
const ProductController = require("./controllers/ProductController");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const requestContext = require("./middleware/requestContext");
const InventoryRepository = require("./repositories/InventoryRepository");
const createMovementRouter = require("./routes/movementRoutes");
const createProductRouter = require("./routes/productRoutes");
const MovementService = require("./services/MovementService");
const ProductService = require("./services/ProductService");

async function createApp(options = {}) {
  const app = express();
  const dataFile = options.dataFile ?? path.join(__dirname, "../data/inventory.json");
  const publicDirectory = path.join(__dirname, "../public");
  const docsDirectory = path.join(__dirname, "../docs");
  const inventoryRepository = new InventoryRepository(dataFile);
  await inventoryRepository.init();

  const productService = new ProductService(inventoryRepository);
  const movementService = new MovementService(inventoryRepository, productService);
  const productController = new ProductController(productService);
  const movementController = new MovementController(movementService);

  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(express.json({ limit: "100kb" }));
  app.use(express.static(publicDirectory));
  app.use("/docs", express.static(docsDirectory));

  app.get("/api", (_request, response) => {
    response.json({
      name: "StockFlow API",
      version: "1.0.0",
      documentation: "/api-docs.html",
      openapi: "/docs/openapi.yaml"
    });
  });
  app.get(["/api/health", "/api/v1/health"], (_request, response) => {
    response.json({ status: "ok", service: "stockflow-api", version: "1.0.0" });
  });
  app.use("/api/v1/products", createProductRouter(productController, movementController));
  app.use("/api/v1/movements", createMovementRouter(movementController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
