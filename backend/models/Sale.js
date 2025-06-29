const mongoose = require('mongoose');

const ProductoVendidoSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1']
    },
    nombreProducto: { // Guardar el nombre para referencia rápida
        type: String,
        required: true
    },
    precioAlMomentoDeVenta: { // Guardar el precio al que se vendió
        type: Number,
        required: true
    }
}, { _id: false });

const SaleSchema = new mongoose.Schema({
    vendedorId: { // El vendedor que realizó la venta
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // clienteId: { // Opcional: si queremos rastrear quién compró
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: false
    // },
    productos: [ProductoVendidoSchema],
    total: {
        type: Number,
        required: true,
        min: [0, 'El total no puede ser negativo']
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    // Podríamos añadir estado de la venta (ej: 'completada', 'pendiente', 'cancelada')
    // estado: {
    //     type: String,
    //     enum: ['pendiente', 'completada', 'cancelada'],
    //     default: 'completada'
    // }
}, {
    timestamps: true // Añade createdAt y updatedAt
});

// Índices para consultas comunes
SaleSchema.index({ vendedorId: 1 });
SaleSchema.index({ fecha: -1 });

// Middleware para calcular el total antes de guardar si no se proporciona (aunque el plan dice que el endpoint lo calcula)
// Sin embargo, es una buena práctica tenerlo aquí también como fallback o para lógica interna.
// SaleSchema.pre('save', function(next) {
//     if (this.isModified('productos') || !this.total) {
//         this.total = this.productos.reduce((acc, item) => {
//             return acc + (item.precioAlMomentoDeVenta * item.cantidad);
//         }, 0);
//     }
//     next();
// });

module.exports = mongoose.model('Sale', SaleSchema);
