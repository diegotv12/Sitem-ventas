const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate que la ruta al modelo User es correcta

// Middleware para proteger rutas y verificar token
const protect = async (req, res, next) => {
    let token;

    // Leer el JWT de la cookie o del header Authorization
    if (req.cookies && req.cookies.token) { // Si usas cookies para el token
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener usuario del token (sin la contraseña)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'No autorizado, usuario no encontrado.' });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de autenticación:', error);
            return res.status(401).json({ message: 'No autorizado, token fallido o inválido.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

// Middleware para autorizar roles específicos (ej. admin)
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin' && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

// Middleware para autorizar a vendedores (o admin, ya que admin puede hacer todo)
const authorizeVendedor = (req, res, next) => {
    if (req.user && (req.user.rol === 'vendedor' || (req.user.rol === 'admin' && req.user.isAdmin))) {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de vendedor o administrador.' });
    }
};


module.exports = { protect, authorizeAdmin, authorizeVendedor };
