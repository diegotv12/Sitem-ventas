const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorizeAdmin, authorizeVendedor } = require('../middleware/authMiddleware');

// @route   GET /api/products - Obtener todos los productos (Público)
// @route   POST /api/products - Crear un nuevo producto (Vendedor o Admin)
router.route('/')
    .get(getProducts)
    .post(protect, authorizeVendedor, createProduct); // Solo vendedores (o admin, ya que authorizeVendedor lo permite) pueden crear

// @route   GET /api/products/:id - Obtener un producto por ID (Público)
// @route   PUT /api/products/:id - Actualizar un producto (Vendedor propietario o Admin)
// @route   DELETE /api/products/:id - Eliminar un producto (Vendedor propietario o Admin)
router.route('/:id')
    .get(getProductById)
    .put(protect, authorizeVendedor, updateProduct) // authorizeVendedor verifica rol vendedor o admin, el controlador verifica propiedad
    .delete(protect, authorizeVendedor, deleteProduct); // authorizeVendedor verifica rol vendedor o admin, el controlador verifica propiedad

module.exports = router;
