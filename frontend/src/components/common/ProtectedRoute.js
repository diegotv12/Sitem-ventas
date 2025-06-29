import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly, vendedorOnly }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Muestra un loader o nada mientras se verifica el estado de autenticación
        // Idealmente, el AuthProvider ya maneja un estado de carga global,
        // y las rutas no se renderizan hasta que loading del AuthContext sea false.
        // Si no, este loader es una segunda capa.
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Verificando autenticación...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Si no está autenticado, redirige a login
        // Pasa la ubicación actual para que el login pueda redirigir de vuelta después de un inicio de sesión exitoso
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si la ruta es solo para admin y el usuario no es admin
    if (adminOnly && (!user || user.rol !== 'admin')) {
        // Redirigir a una página de "No autorizado" o a la página principal
        // Podríamos tener una página específica /unauthorized
        console.warn(`Acceso denegado a ruta adminOnly para usuario con rol: ${user?.rol}`);
        // Podríamos pasar un mensaje de error a través del estado de la ubicación
        return <Navigate to="/" state={{ unauthorizedAttempt: true, message: "No tienes permisos de administrador." }} replace />;
    }

    // Si la ruta es solo para vendedor (o admin, ya que admin puede hacer lo de vendedor)
    // y el usuario no es vendedor ni admin
    if (vendedorOnly && (!user || (user.rol !== 'vendedor' && user.rol !== 'admin'))) {
        console.warn(`Acceso denegado a ruta vendedorOnly para usuario con rol: ${user?.rol}`);
        return <Navigate to="/" state={{ unauthorizedAttempt: true, message: "No tienes permisos de vendedor o administrador." }} replace />;
    }

    // Si pasa todas las verificaciones, renderiza el componente hijo (la página protegida)
    return children;
};

export default ProtectedRoute;
