import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const { register, isAuthenticated } = useContext(AuthContext); // Usamos la función register del context
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'cliente', // Por defecto 'cliente' para registro público general
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { nombre, email, password, confirmPassword, rol } = formData;

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirigir a inicio si ya está logueado
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    setLoading(true);
    try {
      // El endpoint /api/auth/register del backend espera nombre, email, password, y opcionalmente rol.
      // Si el rol no se envía, el backend por defecto lo pone como 'cliente'.
      const userDataToSubmit = { nombre, email, password, rol };

      const response = await api.post('/auth/register', userDataToSubmit);

      // El backend devuelve el usuario y el token.
      // AuthContext.register se encargará de actualizar el estado y localStorage.
      const { token, ...newUserData } = response.data;
      register(newUserData, token); // Auto-login después de registrar

      setSuccess('¡Registro exitoso! Redirigiendo...');
      // Redirigir después de un breve momento o directamente
      setTimeout(() => {
        if (newUserData.rol === 'admin') navigate('/dashboard');
        else if (newUserData.rol === 'vendedor') navigate('/panel-ventas');
        else navigate('/'); // Para clientes o por defecto
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div style={pageStyle}>
      <h2>Crear una Cuenta</h2>
      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label htmlFor="nombre">Nombre Completo:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={nombre}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="password">Contraseña (mín. 6 caracteres):</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            minLength="6"
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            minLength="6"
            required
            style={inputStyle}
          />
        </div>
        {/* Opcional: Si se permite al usuario elegir rol durante el registro público.
            Normalmente, el rol de 'vendedor' o 'admin' se asignaría de otra forma.
            Si este es un registro general, el rol por defecto sería 'cliente'.
        <div style={inputGroupStyle}>
          <label htmlFor="rol">Registrarse como:</label>
          <select name="rol" value={rol} onChange={handleChange} style={inputStyle}>
            <option value="cliente">Cliente</option>
            {/* <option value="vendedor">Vendedor (requiere aprobación)</option> }
          </select>
        </div>
        */}
        <button type="submit" disabled={loading} style={buttonStyle} className="btn btn-primary">
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>
    </div>
  );
};

// Estilos (similares a LoginPage, se pueden centralizar)
const pageStyle = {
  maxWidth: '450px',
  margin: '2rem auto',
  padding: '2rem',
  border: '1px solid #ddd',
  borderRadius: '5px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputGroupStyle = {
  marginBottom: '1rem',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '1rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const buttonStyle = {
  padding: '10px 15px',
  fontSize: '1rem',
  color: '#fff',
  backgroundColor: '#28a745', // Un verde para registro
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '10px'
};

const errorStyle = {
  color: '#721c24',
  backgroundColor: '#f8d7da',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb'
};

const successStyle = {
  color: '#155724',
  backgroundColor: '#d4edda',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '1rem',
  border: '1px solid #c3e6cb'
};

export default RegisterPage;
