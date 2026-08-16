/**
 * Error controlado de la aplicación. Permite separar los errores de negocio
 * de los errores inesperados y asignarles un código HTTP apropiado.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, details = null, code = "APPLICATION_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

module.exports = AppError;
