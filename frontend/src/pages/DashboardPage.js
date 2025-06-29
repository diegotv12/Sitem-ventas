import React from 'react';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const DashboardPage = () => {
  return (
    <div>
      <h2>Dashboard de Administración</h2>
      <p>Resumen y estadísticas del sistema.</p>
      <AdminDashboard />
    </div>
  );
};

export default DashboardPage;
