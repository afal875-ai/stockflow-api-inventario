/** Adapta solicitudes HTTP a las operaciones de movimientos de inventario. */
class MovementController {
  constructor(movementService) {
    this.movementService = movementService;
  }

  list = async (request, response, next) => {
    try {
      const movements = await this.movementService.list(request.query);
      response.json({ data: movements, count: movements.length });
    } catch (error) {
      next(error);
    }
  };

  listByProduct = async (request, response, next) => {
    try {
      const movements = await this.movementService.listByProduct(request.params.id, request.query);
      response.json({ data: movements, count: movements.length });
    } catch (error) {
      next(error);
    }
  };

  create = async (request, response, next) => {
    try {
      const result = await this.movementService.create(request.params.id, request.body);
      response.status(201).json({
        message: "Movimiento registrado correctamente.",
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = MovementController;
