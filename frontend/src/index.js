import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Importar AuthProvider
import './index.css';
import 'leaflet/dist/leaflet.css'; // Importar estilos de Leaflet

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
