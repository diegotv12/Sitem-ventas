const express = require('express');
const router = express.Router();
const {
    registrarVendedor,
    getUsers,
    getUserById,
    updateUserProfile,
    deleteUser
} = require('../controllers/userController');
const { protect, authorizeAdmin, authorizeVendedor } = require('../middleware/authMiddleware');

// Rutas de administración de usuarios (generalmente para Admins)
router.route('/')
    .get(protect, authorizeAdmin, getUsers); // GET /api/users - Listar todos los usuarios (Admin)

router.post('/registrar-vendedor', protect, authorizeAdmin, registrarVendedor); // POST /api/users/registrar-vendedor (Admin)

router.route('/:id')
    .get(protect, authorizeAdmin, getUserById)       // GET /api/users/:id (Admin) - Obtener usuario por ID
    .put(protect, authorizeAdmin, updateUserProfile) // PUT /api/users/:id (Admin) - Actualizar usuario por ID (Admin puede actualizar cualquier perfil)
    .delete(protect, authorizeAdmin, deleteUser);    // DELETE /api/users/:id (Admin) - Eliminar usuario por ID

// Ruta para que un usuario actualice su propio perfil
// Podría ser /api/users/profile o usar el mismo /api/users/:id pero con lógica en el controlador
// para diferenciar si es el propio usuario o un admin.
// Por simplicidad, el controlador updateUserProfile ya maneja la lógica de req.user._id vs req.params.id
// si se llama sin :id (ej. PUT /api/users/profile) y el ID se toma de req.user.
// Pero para que coincida con el controlador actual, mantendré :id y el controlador lo usará.
// Una ruta específica para 'profile' podría ser más clara:
// router.route('/profile')
//    .get(protect, getMyProfile) // getMyProfile sería una función en userController similar a getMe en authController
//    .put(protect, updateMyProfile); // updateMyProfile sería una función en userController

module.exports = router;
