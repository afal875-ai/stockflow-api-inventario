const express = require("express");

function createProductRouter(productController, movementController) {
  const router = express.Router();

  router.get("/summary", productController.summary);
  router.get("/categories", productController.categories);
  router.get("/", productController.list);
  router.get("/:id", productController.getById);
  router.get("/:id/movements", movementController.listByProduct);
  router.post("/", productController.create);
  router.post("/:id/movements", movementController.create);
  router.put("/:id", productController.update);
  router.patch("/:id", productController.update);
  router.delete("/:id", productController.delete);

  return router;
}

module.exports = createProductRouter;
