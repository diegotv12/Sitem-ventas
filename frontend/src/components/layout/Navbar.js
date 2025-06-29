import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importar useAuth

const Navbar = () => {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Aquí podrías llamar al endpoint de logout del backend si es necesario
        // await api.post('/auth/logout'); // Asumiendo que api está disponible o se importa
        logout(); // Limpia el estado local y el token
        navigate('/login');
    };

    if (loading) {
        return (
            <nav style={navStyle}>
                 <Link to="/" style={linkStyle}><h1 style={logoStyle}>Sistema Ventas</h1></Link>
                 <ul style={ulStyle}><li style={liStyle}>Cargando...</li></ul>
            </nav>
        );
    }

    return (
        <nav style={navStyle}>
            <Link to="/" style={linkStyle}><h1 style={logoStyle}>Sistema Ventas</h1></Link>
            <ul style={ulStyle}>
                <li style={liStyle}><Link to="/" style={linkStyle}>Inicio</Link></li>

                {isAuthenticated ? (
                    <>
                        {user?.rol === 'vendedor' && (
                            <li style={liStyle}><Link to="/panel-ventas" style={linkStyle}>Panel Ventas</Link></li>
                        )}
                        {user?.rol === 'admin' && (
                            <>
                                <li style={liStyle}><Link to="/registrar-vendedor" style={linkStyle}>Reg. Vendedor</Link></li>
                                <li style={liStyle}><Link to="/dashboard" style={linkStyle}>Dashboard</Link></li>
                                {/* Podríamos añadir más enlaces de admin aquí, ej: /admin/userlist, /admin/productlist */}
                            </>
                        )}
                        <li style={liStyle}><span style={welcomeStyle}>Hola, {user?.nombre}</span></li>
                        <li style={liStyle}>
                            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li style={liStyle}><Link to="/login" style={linkStyle}>Login</Link></li>
                        <li style={liStyle}><Link to="/register" style={linkStyle}>Registrarse</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

// Estilos básicos para el Navbar
const navStyle = {
    background: '#343a40', // Un gris oscuro, bootstrap-like
    color: '#f8f9fa', // Texto claro
    padding: '0.5rem 1.5rem', // Padding vertical y horizontal
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Sombra sutil
};

const logoStyle = {
    margin: '0',
    fontSize: '1.75rem', // Tamaño del logo
};

const ulStyle = {
    listStyle: 'none',
    display: 'flex',
    alignItems: 'center', // Alinear items verticalmente
    margin: 0,
    padding: 0
};

const liStyle = {
    marginLeft: '1rem' // Espacio entre items
};

const linkStyle = {
    color: '#f8f9fa',
    textDecoration: 'none',
    padding: '0.5rem', // Padding para hacer click más fácil
    borderRadius: '4px', // Bordes redondeados
    transition: 'background-color 0.2s ease-in-out', // Transición suave
};

// linkStyle[':hover'] no funciona en inline styles, se necesitaría CSS Modules o styled-components
// Para un hover simple, se podría usar un estado o directamente en un archivo CSS.
// Por ahora, lo dejamos así.

const welcomeStyle = {
    color: '#adb5bd', // Un color más suave para el saludo
    marginRight: '0.5rem',
};

const buttonStyle = {
    background: '#007bff', // Azul primario
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '1rem', // Asegurar que el tamaño de fuente sea consistente
    transition: 'background-color 0.2s ease-in-out',
};
// buttonStyle[':hover'] ...

export default Navbar;
