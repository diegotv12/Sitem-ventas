import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Para verificar rol y proteger

const AdminDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user && user.rol === 'admin') {
                try {
                    setLoading(true);
                    setError('');
                    const { data } = await api.get('/dashboard');
                    setDashboardData(data);
                } catch (err) {
                    setError('Error al cargar los datos del dashboard.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                // No es admin, podría redirigir o simplemente no mostrar nada.
                // La página DashboardPage ya debería estar protegida por una ProtectedRoute.
            }
        };

        fetchDashboardData();
    }, [user]);

    if (!user || user.rol !== 'admin') {
        return <p style={errorStyle}>Acceso denegado. Esta sección es solo para administradores.</p>;
    }

    if (loading) {
        return <p>Cargando datos del dashboard...</p>;
    }

    if (error) {
        return <p style={errorStyle}>{error}</p>;
    }

    if (!dashboardData) {
        return <p>No hay datos disponibles para mostrar en el dashboard.</p>;
    }

    const {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalVendedores,
        totalProducts,
        dailySales, // Array: [{ _id: 'YYYY-MM-DD', dailyTotal: X, count: Y }]
        topProductsByQuantity, // Array: [{ _id: productId, nombreProducto: 'Nombre', totalQuantitySold: X }]
        topSellersByRevenue // Array: [{ _id: vendedorId, vendedorNombre: 'Nombre', totalRevenueGenerated: X, totalSalesCount: Y }]
    } = dashboardData;

    return (
        <div style={dashboardStyle}>
            <h2>Resumen General</h2>
            <div style={gridStyle}>
                <Card title="Ingresos Totales" value={`$${totalRevenue?.toFixed(2) || '0.00'}`} />
                <Card title="Ventas Totales (Órdenes)" value={totalOrders || 0} />
                <Card title="Usuarios Totales" value={totalUsers || 0} />
                <Card title="Vendedores Activos" value={totalVendedores || 0} />
                <Card title="Productos Registrados" value={totalProducts || 0} />
            </div>

            {dailySales && dailySales.length > 0 && (
                <Section title="Ventas de los Últimos 7 Días">
                    {/* Aquí se podría integrar una gráfica simple */}
                    <ul style={listStyle}>
                        {dailySales.map(sale => (
                            <li key={sale._id} style={listItemStyle}>
                                {sale._id}: ${sale.dailyTotal.toFixed(2)} ({sale.count} órdenes)
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {topProductsByQuantity && topProductsByQuantity.length > 0 && (
                 <Section title="Top 5 Productos Más Vendidos (por cantidad)">
                    <table style={tableStyle}>
                        <thead><tr><th style={thStyle}>Producto</th><th style={thStyle}>Cantidad Vendida</th></tr></thead>
                        <tbody>
                            {topProductsByQuantity.map(p => (
                                <tr key={p._id || p.nombreProducto}><td>{p.nombreProducto}</td><td>{p.totalQuantitySold}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </Section>
            )}

            {topSellersByRevenue && topSellersByRevenue.length > 0 && (
                <Section title="Top 5 Vendedores (por ingresos generados)">
                     <table style={tableStyle}>
                        <thead><tr><th style={thStyle}>Vendedor</th><th style={thStyle}>Negocio</th><th style={thStyle}>Ingresos</th><th style={thStyle}>Ventas</th></tr></thead>
                        <tbody>
                            {topSellersByRevenue.map(s => (
                                <tr key={s._id}>
                                    <td>{s.vendedorNombre || 'N/A'} ({s.vendedorEmail || 'N/A'})</td>
                                    <td>{s.negocio || 'N/A'}</td>
                                    <td>${s.totalRevenueGenerated.toFixed(2)}</td>
                                    <td>{s.totalSalesCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>
            )}
        </div>
    );
};

// Componentes internos para el layout del dashboard
const Card = ({ title, value }) => (
    <div style={cardStyle}>
        <h3 style={cardTitleStyle}>{title}</h3>
        <p style={cardValueStyle}>{value}</p>
    </div>
);

const Section = ({ title, children }) => (
    <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>{title}</h3>
        {children}
    </div>
);

// Estilos
const dashboardStyle = { padding: '20px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' };
const cardTitleStyle = { margin: '0 0 10px 0', fontSize: '1rem', color: '#555' };
const cardValueStyle = { margin: '0', fontSize: '1.8rem', fontWeight: 'bold', color: '#333' };

const sectionStyle = { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' };
const sectionTitleStyle = { marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' };

const listStyle = { listStyleType: 'none', paddingLeft: '0' };
const listItemStyle = { padding: '8px 0', borderBottom: '1px dashed #eee' };

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thStyle = { borderBottom: '2px solid #ddd', padding: '10px 8px', background: '#f9f9f9', textAlign: 'left' };
// const tdStyle = { borderBottom: '1px solid #eee', padding: '10px 8px' }; // Definido en PanelVentas, podría centralizarse

const errorStyle = { color: 'red', background: '#fdd', padding: '10px', borderRadius: '4px', textAlign: 'center' };

export default AdminDashboard;
