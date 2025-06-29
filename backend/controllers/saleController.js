const Sale = require('../models/Sale');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');

// @desc    Crear una nueva venta
// @route   POST /api/sales
// @access  Privado (Vendedor/Admin - o Cliente si se implementa compra directa)
const createSale = asyncHandler(async (req, res) => {
    const { productos } = req.body; // productos: [{ productoId, cantidad }]
    const vendedorId = req.user._id; // Asumimos que el vendedor logueado es quien registra la venta

    if (!productos || productos.length === 0) {
        res.status(400);
        throw new Error('No se proporcionaron productos para la venta.');
    }

    // Iniciar una sesión de MongoDB para transacciones si es posible/necesario
    // Para operaciones atómicas de lectura de stock y actualización.
    // Esto requiere un conjunto de réplicas en MongoDB. Si no está disponible,
    // se debe manejar la consistencia de datos con cuidado.
    // Por ahora, no implementaré la transacción explícita para simplificar,
    // pero es una consideración importante para producción.

    let totalVenta = 0;
    const productosParaVenta = [];
    const actualizacionesStock = [];

    for (const item of productos) {
        const productoDB = await Product.findById(item.productoId);

        if (!productoDB) {
            res.status(404);
            throw new Error(`Producto con ID ${item.productoId} no encontrado.`);
        }

        if (productoDB.stock < item.cantidad) {
            res.status(400);
            throw new Error(`Stock insuficiente para ${productoDB.nombre}. Stock disponible: ${productoDB.stock}, Solicitado: ${item.cantidad}.`);
        }

        // Acumular el total y preparar los datos del producto para la venta
        const precioVentaItem = productoDB.precio * item.cantidad;
        totalVenta += precioVentaItem;

        productosParaVenta.push({
            productoId: item.productoId,
            cantidad: item.cantidad,
            nombreProducto: productoDB.nombre,
            precioAlMomentoDeVenta: productoDB.precio // Precio unitario al momento de la venta
        });

        // Preparar la operación de actualización de stock
        actualizacionesStock.push({
            updateOne: {
                filter: { _id: item.productoId },
                update: { $inc: { stock: -item.cantidad } }
            }
        });
    }

    // Crear la venta
    const sale = new Sale({
        vendedorId,
        // clienteId: req.body.clienteId, // Opcional, si se quiere registrar el cliente
        productos: productosParaVenta,
        total: totalVenta,
        fecha: new Date()
    });

    const createdSale = await sale.save();

    // Actualizar el stock de los productos (operación bulk)
    if (actualizacionesStock.length > 0) {
        await Product.bulkWrite(actualizacionesStock);
    }

    res.status(201).json(createdSale);
});

// @desc    Obtener todas las ventas (con filtros y paginación)
// @route   GET /api/sales
// @access  Privado (Admin o Vendedor para sus propias ventas)
const getSales = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    let query = {};

    // Si no es admin, solo puede ver sus propias ventas (si es vendedor)
    if (req.user.rol === 'vendedor') {
        query.vendedorId = req.user._id;
    } else if (req.user.rol !== 'admin') {
        // Si no es admin ni vendedor (ej. 'cliente'), no debería acceder a todas las ventas.
        // Podría implementarse que un cliente vea sus propias compras si se añade 'clienteId' a Sale.
        res.status(403);
        throw new Error('No autorizado para ver esta información de ventas.');
    }
    // Si es admin, puede ver todas las ventas (query queda vacío o puede tener otros filtros)

    // Filtro por vendedorId si se proporciona y el usuario es admin
    if (req.user.rol === 'admin' && req.query.vendedorId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.vendedorId)) {
            res.status(400);
            throw new Error('ID de vendedor inválido.');
        }
        query.vendedorId = req.query.vendedorId;
    }

    // Filtro por rango de fechas (opcional)
    if (req.query.fechaInicio) {
        query.fecha = { ...query.fecha, $gte: new Date(req.query.fechaInicio) };
    }
    if (req.query.fechaFin) {
        query.fecha = { ...query.fecha, $lte: new Date(req.query.fechaFin) };
    }


    const count = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
        .populate('vendedorId', 'nombre email negocio') // Datos del vendedor
        .populate('productos.productoId', 'nombre') // Nombre del producto dentro de la lista
        .sort({ fecha: -1 }) // Ventas más recientes primero
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ sales, page, pages: Math.ceil(count / pageSize), count });
});

// @desc    Obtener una venta por ID
// @route   GET /api/sales/:id
// @access  Privado (Admin o Vendedor propietario)
const getSaleById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('ID de venta inválido.');
    }
    const sale = await Sale.findById(req.params.id)
        .populate('vendedorId', 'nombre email negocio')
        .populate('productos.productoId', 'nombre categoria');

    if (!sale) {
        res.status(404);
        throw new Error('Venta no encontrada.');
    }

    // Verificar permisos: solo admin o el vendedor de esa venta pueden verla
    if (req.user.rol !== 'admin' && sale.vendedorId._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('No autorizado para ver esta venta.');
    }

    res.json(sale);
});


// No se incluyen PUT o DELETE para ventas en este plan, ya que generalmente las ventas son inmutables
// o se manejan con devoluciones/cancelaciones que son procesos diferentes.

module.exports = {
    createSale,
    getSales,
    getSaleById
};
