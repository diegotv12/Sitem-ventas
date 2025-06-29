const express = require('express');
const router = express.Router();
const {
    createSale,
    getSales,
    getSaleById
} = require('../controllers/saleController');
const { protect, authorizeAdmin, authorizeVendedor } = require('../middleware/authMiddleware');

// @route   POST /api/sales - Crear una nueva venta
//          Requiere rol de vendedor o admin (authorizeVendedor permite ambos)
// @route   GET /api/sales - Obtener todas las ventas (Admin) o las propias (Vendedor)
router.route('/')
    .post(protect, authorizeVendedor, createSale)
    .get(protect, authorizeVendedor, getSales); // authorizeVendedor permite acceso a vendedores y admins. El controlador filtra.

// @route   GET /api/sales/:id - Obtener una venta por ID
//          Requiere rol de vendedor (propietario) o admin. El controlador verifica.
router.route('/:id')
    .get(protect, authorizeVendedor, getSaleById);

module.exports = router;
