import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'; // Redirigir a la página anterior o a inicio
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      // El backend debería devolver el usuario y el token en response.data
      // Por ejemplo: { _id, nombre, email, rol, isAdmin, token }
      const { token, ...userData } = response.data;
      login(userData, token); // Guardar token y datos de usuario en AuthContext

      // Redirigir al dashboard o página principal según el rol
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (userData.rol === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (userData.rol === 'vendedor') {
        navigate('/panel-ventas', { replace: true });
      } else {
        navigate('/', { replace: true });
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
    setLoading(false);
  };

  return (
    <div style={pageStyle}>
      <h2>Iniciar Sesión</h2>
      {error && <p style={errorStyle}>{error}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={loading} style={buttonStyle} className="btn btn-primary">
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

// Estilos (se pueden mover a un archivo CSS/módulo CSS)
const pageStyle = {
  maxWidth: '400px',
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
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '10px'
};

const errorStyle = {
  color: 'red',
  backgroundColor: '#f8d7da',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '1rem',
  border: '1px solid #f5c6cb'
};


export default LoginPage;
