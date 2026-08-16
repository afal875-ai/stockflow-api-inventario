const express = require("express");

function createMovementRouter(movementController) {
  const router = express.Router();
  router.get("/", movementController.list);
  return router;
}

module.exports = createMovementRouter;
