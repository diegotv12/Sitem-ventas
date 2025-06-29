const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Registrar un nuevo vendedor (por un Admin)
// @route   POST /api/users/registrar-vendedor
// @access  Privado/Admin
const registrarVendedor = asyncHandler(async (req, res) => {
    const { nombre, email, password, telefono, ubicacion, negocio, fotos } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Un usuario ya existe con ese email.');
    }

    // Crear vendedor con rol 'vendedor'
    const vendedor = await User.create({
        nombre,
        email,
        password, // El hash se hace en el pre-save hook del modelo User
        rol: 'vendedor', // Rol asignado directamente
        telefono,
        ubicacion,
        negocio,
        fotos,
        isAdmin: false // Los vendedores no son administradores por defecto
    });

    if (vendedor) {
        res.status(201).json({
            _id: vendedor._id,
            nombre: vendedor.nombre,
            email: vendedor.email,
            rol: vendedor.rol,
            negocio: vendedor.negocio,
        });
    } else {
        res.status(400);
        throw new Error('Datos de vendedor inválidos.');
    }
});

// @desc    Obtener todos los usuarios (o filtrar por rol, ej. vendedores)
// @route   GET /api/users
// @access  Privado/Admin
const getUsers = asyncHandler(async (req, res) => {
    // Podríamos filtrar por rol si se pasa como query param, ej /api/users?rol=vendedor
    const query = req.query.rol ? { rol: req.query.rol } : {};
    const users = await User.find(query).select('-password');
    res.json(users);
});

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Privado/Admin (o el propio usuario)
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        // Verificar si el que solicita es admin o el propio usuario
        // if (req.user.rol !== 'admin' && req.user._id.toString() !== user._id.toString()) {
        //     res.status(403);
        //     throw new Error('No autorizado para acceder a este perfil.');
        // }
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

// @desc    Actualizar perfil de usuario (general, podría ser usado por el propio usuario o admin)
// @route   PUT /api/users/profile/:id  o /api/users/:id
// @access  Privado (propio usuario o Admin)
const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user._id; // Admin puede especificar ID, usuario actualiza su propio perfil
    const user = await User.findById(userId);

    if (user) {
        // Solo permitir que el admin cambie el rol o isAdmin
        if (req.user.rol === 'admin' && req.user.isAdmin) {
            if (req.body.rol) user.rol = req.body.rol;
            if (typeof req.body.isAdmin === 'boolean') user.isAdmin = req.body.isAdmin;
        } else if (req.body.rol || typeof req.body.isAdmin === 'boolean') {
            // Si un no-admin intenta cambiar rol o isAdmin
            res.status(403);
            throw new Error('No autorizado para modificar el rol o estado de administrador.');
        }

        user.nombre = req.body.nombre || user.nombre;
        user.email = req.body.email || user.email; // Considerar validación de email único si cambia
        user.telefono = req.body.telefono || user.telefono;
        user.ubicacion = req.body.ubicacion || user.ubicacion;
        user.negocio = req.body.negocio || user.negocio;
        if (req.body.fotos) user.fotos = req.body.fotos; // Reemplaza todas las fotos

        if (req.body.password) {
            user.password = req.body.password; // El pre-save hook se encargará del hash
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            nombre: updatedUser.nombre,
            email: updatedUser.email,
            rol: updatedUser.rol,
            isAdmin: updatedUser.isAdmin,
            telefono: updatedUser.telefono,
            ubicacion: updatedUser.ubicacion,
            negocio: updatedUser.negocio,
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});


// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Privado/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.isAdmin && user._id.toString() === req.user._id.toString()) {
             res.status(400);
             throw new Error('Los administradores no pueden eliminarse a sí mismos de esta forma.');
        }
        if (user.isAdmin && !(req.user.rol === 'admin' && req.user.isAdmin && req.user._id.toString() !== user._id.toString())) {
            // Solo otro admin puede eliminar a un admin, y no a sí mismo.
            // Esta lógica es un poco compleja, podría simplificarse o hacerse más robusta.
            // Por ahora, una protección simple: no permitir eliminar admins a menos que seas otro admin.
            // Idealmente, el primer admin no debería ser eliminable por esta vía.
            // if (user.email === process.env.ADMIN_EMAIL) { // Proteger al admin semilla
            //    res.status(400);
            //    throw new Error('No se puede eliminar al administrador principal.');
            // }
        }

        // TODO: Considerar qué pasa con los productos y ventas de un vendedor eliminado.
        // Podría ser necesario:
        // 1. Reasignarlos a un usuario "genérico".
        // 2. Marcarlos como "archivados" o "sin vendedor".
        // 3. Impedir la eliminación si tiene entidades asociadas activas.
        // Por ahora, se elimina el usuario directamente.

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'Usuario eliminado.' });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});


module.exports = {
    registrarVendedor,
    getUsers,
    getUserById,
    updateUserProfile,
    deleteUser
};
