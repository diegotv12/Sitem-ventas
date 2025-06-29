const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UbicacionSchema = new mongoose.Schema({
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Por favor, introduce un email válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    rol: {
        type: String,
        enum: ['vendedor', 'admin', 'cliente'], // 'cliente' podría ser un rol futuro
        default: 'vendedor' // Por defecto al registrar un vendedor, o podría ser 'cliente' si hay registro general
    },
    telefono: {
        type: String,
        trim: true
    },
    ubicacion: UbicacionSchema,
    negocio: { // Nombre del negocio o tienda del vendedor
        type: String,
        trim: true
    },
    fotos: [{ // URLs o strings base64 de las fotos del negocio/vendedor
        type: String
    }],
    // Campo para admin (si es necesario diferenciarlo más allá del rol)
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Añade createdAt y updatedAt
});

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Asegurar que el rol 'admin' tenga isAdmin = true
UserSchema.pre('save', function(next) {
    if (this.rol === 'admin' && !this.isAdmin) {
        this.isAdmin = true;
    }
    // Si se cambia de admin a otro rol, y no se especifica isAdmin, ponerlo a false
    if (this.rol !== 'admin' && this.isAdmin === undefined) {
        this.isAdmin = false;
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
