const AppError = require("../utils/AppError");

function notFoundHandler(request, response) {
  response.status(404).json({
    error: "Ruta no encontrada",
    code: "ROUTE_NOT_FOUND",
    message: `No existe el recurso ${request.method} ${request.originalUrl}.`,
    details: null,
    requestId: request.id
  });
}

// Centralizar las respuestas de error mantiene el contrato de la API uniforme.
function errorHandler(error, _request, response, _next) {
  if (error.type === "entity.parse.failed") {
    response.status(400).json({
      error: "BadRequest",
      code: "INVALID_JSON",
      message: "El cuerpo de la solicitud no contiene un JSON válido.",
      details: null,
      requestId: _request.id
    });
    return;
  }

  const isControlled = error instanceof AppError;
  const statusCode = isControlled ? error.statusCode : 500;

  if (!isControlled) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: isControlled ? error.name : "InternalServerError",
    code: isControlled ? error.code : "INTERNAL_ERROR",
    message: isControlled ? error.message : "Ocurrió un error inesperado.",
    details: isControlled ? error.details : null,
    requestId: _request.id
  });
}

module.exports = { errorHandler, notFoundHandler };
