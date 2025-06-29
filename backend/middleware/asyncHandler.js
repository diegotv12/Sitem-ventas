// Este es un middleware simple para envolver funciones de controlador asíncronas
// y pasar cualquier error al siguiente middleware de manejo de errores de Express.
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
