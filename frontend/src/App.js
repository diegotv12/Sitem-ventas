import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterVendedorPage from './pages/RegisterVendedorPage';
import VentasPage from './pages/VentasPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute'; // Importar ProtectedRoute

// Otros componentes de página que podrían añadirse en el futuro:
// import ProductListPage from './pages/ProductListPage';
// import ProductDetailPage from './pages/ProductDetailPage';
// import AdminProductListPage from './pages/AdminProductListPage';
// import AdminUserListPage from './pages/AdminUserListPage';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route path="/products" element={<ProductListPage />} /> */}
          {/* <Route path="/product/:id" element={<ProductDetailPage />} /> */}

          {/* Rutas Protegidas */}
          <Route
            path="/registrar-vendedor"
            element={
              <ProtectedRoute adminOnly={true}>
                <RegisterVendedorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel-ventas"
            element={
              <ProtectedRoute vendedorOnly={true}>
                <VentasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Ejemplo de otras rutas protegidas para admin (si se implementan las páginas) */}
          {/*
          <Route
            path="/admin/productlist"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProductListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/userlist"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminUserListPage />
              </ProtectedRoute>
            }
          />
          */}

          {/* Ruta para "no encontrado" */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h2>404 - Página No Encontrada</h2>
              <p>Lo sentimos, la página que buscas no existe.</p>
              <Link to="/">Volver al Inicio</Link>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
