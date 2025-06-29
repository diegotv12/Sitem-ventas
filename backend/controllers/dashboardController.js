const asyncHandler = require('../middleware/asyncHandler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Obtener datos agregados para el dashboard del administrador
// @route   GET /api/dashboard
// @access  Privado/Admin
const getDashboardData = asyncHandler(async (req, res) => {
    // 1. Total de ventas (ingresos)
    const totalSalesResult = await Sale.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalSalesResult.length > 0 ? totalSalesResult[0].totalRevenue : 0;

    // 2. Número total de ventas (transacciones)
    const totalOrders = await Sale.countDocuments();

    // 3. Número total de usuarios (clientes y vendedores)
    const totalUsers = await User.countDocuments();
    const totalVendedores = await User.countDocuments({ rol: 'vendedor' });
    // const totalClientes = await User.countDocuments({ rol: 'cliente' }); // Si se implementa rol cliente

    // 4. Número total de productos
    const totalProducts = await Product.countDocuments();

    // 5. Ventas por día/semana/mes (ejemplo: ventas en los últimos 7 días)
    const dailySales = await Sale.aggregate([
        {
            $match: {
                fecha: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } // Últimos 7 días
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
                dailyTotal: { $sum: '$total' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } } // Ordenar por fecha
    ]);

    // 6. Productos más vendidos (Top 5 por cantidad)
    const topProductsByQuantity = await Sale.aggregate([
        { $unwind: '$productos' }, // Desglosar el array de productos
        {
            $group: {
                _id: '$productos.productoId', // Agrupar por productoId
                nombreProducto: { $first: '$productos.nombreProducto' }, // Tomar el nombre (asumiendo que es constante)
                totalQuantitySold: { $sum: '$productos.cantidad' }
            }
        },
        { $sort: { totalQuantitySold: -1 } }, // Ordenar por cantidad vendida descendente
        { $limit: 5 }, // Top 5
        { // Opcional: popular el nombre del producto desde la colección Products si no se guardó en Sale.productos
            $lookup: {
                from: Product.collection.name, // Nombre de la colección de productos
                localField: '_id', // Campo de Sale.productos.productoId (ahora _id por el group)
                foreignField: '_id', // Campo _id en Product
                as: 'productDetails'
            }
        },
        { // Si se usó $lookup, ajustar la salida
            $project: {
                _id: 1,
                nombreProducto: { $ifNull: ['$nombreProducto', { $arrayElemAt: ['$productDetails.nombre', 0] }] },
                totalQuantitySold: 1
            }
        }
    ]);

    // 7. Vendedores con más ventas (Top 5 por ingresos generados)
    const topSellersByRevenue = await Sale.aggregate([
        {
            $group: {
                _id: '$vendedorId',
                totalRevenueGenerated: { $sum: '$total' },
                totalSalesCount: { $sum: 1 }
            }
        },
        { $sort: { totalRevenueGenerated: -1 } },
        { $limit: 5 },
        { // Popular datos del vendedor
            $lookup: {
                from: User.collection.name,
                localField: '_id',
                foreignField: '_id',
                as: 'vendedorDetails'
            }
        },
        { // Ajustar la salida
            $project: {
                _id: 1,
                vendedorNombre: { $arrayElemAt: ['$vendedorDetails.nombre', 0] },
                vendedorEmail: { $arrayElemAt: ['$vendedorDetails.email', 0] },
                negocio: { $arrayElemAt: ['$vendedorDetails.negocio', 0] },
                totalRevenueGenerated: 1,
                totalSalesCount: 1
            }
        }
    ]);


    res.json({
        totalRevenue,
        totalOrders,
        totalUsers,
        totalVendedores,
        // totalClientes,
        totalProducts,
        dailySales, // Ventas de los últimos 7 días
        topProductsByQuantity,
        topSellersByRevenue
    });
});

module.exports = {
    getDashboardData
};
