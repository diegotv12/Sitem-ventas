const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler'); // Un wrapper simple para manejo de errores async

// Helper para generar token JWT
const generateToken = (id, rol, isAdmin) => {
    return jwt.sign({ id, rol, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '30d', // El token expira en 30 días
    });
};

// @desc    Registrar un nuevo usuario (puede ser usado por admin para crear vendedores o un registro público)
// @route   POST /api/auth/register
// @access  Público (o Admin si se protege la ruta)
const registerUser = asyncHandler(async (req, res) => {
    const { nombre, email, password, rol, telefono, ubicacion, negocio, fotos } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400); // Bad Request
        throw new Error('El usuario ya existe con ese email.');
    }

    // Crear usuario
    const user = await User.create({
        nombre,
        email,
        password, // El hash se hace en el pre-save hook del modelo
        rol: rol || 'cliente', // Por defecto 'cliente' si no se especifica rol
        telefono,
        ubicacion,
        negocio,
        fotos
    });

    if (user) {
        // Generar token
        const token = generateToken(user._id, user.rol, user.isAdmin);

        // Enviar cookie con el token (HttpOnly para seguridad)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development', // true en producción (HTTPS)
            sameSite: 'strict', // Mitiga CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
        });

        res.status(201).json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            isAdmin: user.isAdmin,
            token: token // También se puede devolver el token en el cuerpo para clientes no web
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario inválidos.');
    }
});

// @desc    Autenticar (login) usuario y obtener token
// @route   POST /api/auth/login
// @access  Público
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Por favor, proporcione email y contraseña.');
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        const token = generateToken(user._id, user.rol, user.isAdmin);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            isAdmin: user.isAdmin,
            token: token // Devolver también el token para flexibilidad
        });
    } else {
        res.status(401); // No autorizado
        throw new Error('Email o contraseña inválidos.');
    }
});

// @desc    Cerrar sesión del usuario
// @route   POST /api/auth/logout
// @access  Privado (requiere estar logueado)
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', { // Limpiar la cookie
        httpOnly: true,
        expires: new Date(0) // Expira inmediatamente
    });
    res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
});

// @desc    Obtener perfil del usuario logueado
// @route   GET /api/auth/me
// @access  Privado
const getMe = asyncHandler(async (req, res) => {
    // req.user es establecido por el middleware 'protect'
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            isAdmin: user.isAdmin,
            telefono: user.telefono,
            ubicacion: user.ubicacion,
            negocio: user.negocio,
            fotos: user.fotos
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe
};
