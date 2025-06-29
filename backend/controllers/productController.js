const Product = require('../models/Product');
const User = require('../models/User'); // Necesario para verificar si el vendedor existe
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Privado/Vendedor o Admin
const createProduct = asyncHandler(async (req, res) => {
    const { nombre, precio, stock, descripcion, categoria, imagenesProducto } = req.body;
    const vendedorId = req.user._id; // El ID del vendedor logueado

    // Verificar que el usuario sea vendedor o admin
    if (!(req.user.rol === 'vendedor' || req.user.rol === 'admin')) {
        res.status(403);
        throw new Error('No autorizado para crear productos. Se requiere rol de vendedor o administrador.');
    }

    // Validar que el vendedor exista (aunque req.user ya lo confirma si el token es válido)
    const vendedorExists = await User.findById(vendedorId);
    if (!vendedorExists) {
        res.status(404);
        throw new Error('Vendedor no encontrado.');
    }

    const product = new Product({
        nombre,
        precio,
        stock,
        vendedorId,
        descripcion,
        categoria,
        imagenesProducto
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Obtener todos los productos (con paginación y búsqueda opcional)
// @route   GET /api/products
// @access  Público
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10; // Productos por página
    const page = Number(req.query.pageNumber) || 1; // Número de página

    const keyword = req.query.keyword ? {
        nombre: { // Búsqueda por nombre del producto
            $regex: req.query.keyword,
            $options: 'i' // Insensible a mayúsculas/minúsculas
        }
    } : {};

    // Se pueden añadir más filtros, ej. por categoría, precio, etc.
    // const categoriaFilter = req.query.categoria ? { categoria: req.query.categoria } : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .populate('vendedorId', 'nombre negocio email') // Popular datos del vendedor
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), count });
});

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Público
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('vendedorId', 'nombre negocio email');
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Producto no encontrado.');
    }
});

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Privado/Vendedor propietario o Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { nombre, precio, stock, descripcion, categoria, imagenesProducto } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado.');
    }

    // Verificar si el usuario es el vendedor del producto o un admin
    if (product.vendedorId.toString() !== req.user._id.toString() && !(req.user.rol === 'admin' && req.user.isAdmin)) {
        res.status(403); // Forbidden
        throw new Error('No autorizado para actualizar este producto.');
    }

    product.nombre = nombre || product.nombre;
    product.precio = precio === undefined ? product.precio : precio; // Permitir precio 0
    product.stock = stock === undefined ? product.stock : stock;   // Permitir stock 0
    product.descripcion = descripcion || product.descripcion;
    product.categoria = categoria || product.categoria;
    product.imagenesProducto = imagenesProducto || product.imagenesProducto;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Privado/Vendedor propietario o Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Producto no encontrado.');
    }

    // Verificar si el usuario es el vendedor del producto o un admin
    if (product.vendedorId.toString() !== req.user._id.toString() && !(req.user.rol === 'admin' && req.user.isAdmin)) {
        res.status(403);
        throw new Error('No autorizado para eliminar este producto.');
    }

    // Considerar si hay ventas asociadas. Por ahora, se elimina directamente.
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Producto eliminado.' });
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
