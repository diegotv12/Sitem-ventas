const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio del producto es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: [true, 'El stock del producto es obligatorio'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    vendedorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo User
        required: [true, 'El ID del vendedor es obligatorio']
    },
    // Podríamos añadir más campos como descripción, categoría, imágenes del producto, etc.
    descripcion: {
        type: String,
        trim: true
    },
    categoria: {
        type: String,
        trim: true
    },
    imagenesProducto: [{ // URLs o strings base64 de las imágenes del producto
        type: String
    }]
}, {
    timestamps: true // Añade createdAt y updatedAt
});

// Índice para buscar productos por vendedor más eficientemente
ProductSchema.index({ vendedorId: 1 });
// Índice para buscar productos por nombre (texto)
ProductSchema.index({ nombre: 'text', descripcion: 'text' });


module.exports = mongoose.model('Product', ProductSchema);
