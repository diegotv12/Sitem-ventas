import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PanelVentas = () => {
    const { user } = useAuth();
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]); // { productoId, nombre, cantidad, precio, stockMax }
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Para buscar productos

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Podríamos filtrar por vendedorId si el endpoint lo permite y es necesario
                // o si el vendedor solo puede vender sus propios productos (lo cual es lo usual)
                // Si un admin usa este panel, quizás quiera ver todos.
                // Por ahora, el endpoint GET /api/products devuelve todos.
                const { data } = await api.get('/products?pageSize=100'); // Traer una buena cantidad para el selector
                setProductosDisponibles(data.products || []);
            } catch (err) {
                setError('Error al cargar productos disponibles.');
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    const handleAddProduct = (producto) => {
        if (!producto || !producto._id) return;

        const existingProduct = productosSeleccionados.find(p => p.productoId === producto._id);
        if (existingProduct) {
            // Simplemente enfocar o alertar, o incrementar cantidad si se desea
            setError(`El producto "${producto.nombre}" ya está en la lista. Ajusta la cantidad directamente.`);
            setTimeout(() => setError(''), 3000);
            return;
        }
        if (producto.stock <= 0) {
            setError(`El producto "${producto.nombre}" no tiene stock disponible.`);
            setTimeout(() => setError(''), 3000);
            return;
        }

        setProductosSeleccionados([
            ...productosSeleccionados,
            {
                productoId: producto._id,
                nombre: producto.nombre,
                cantidad: 1,
                precio: producto.precio,
                stockMax: producto.stock
            }
        ]);
        setSearchTerm(''); // Limpiar búsqueda
    };

    const handleRemoveProduct = (productoId) => {
        setProductosSeleccionados(productosSeleccionados.filter(p => p.productoId !== productoId));
    };

    const handleQuantityChange = (productoId, cantidad) => {
        const nuevaCantidad = parseInt(cantidad, 10);
        setProductosSeleccionados(
            productosSeleccionados.map(p => {
                if (p.productoId === productoId) {
                    if (nuevaCantidad <= 0) return { ...p, cantidad: 1 }; // Mínimo 1 si ya está en lista
                    if (nuevaCantidad > p.stockMax) {
                        setError(`Stock máximo para "${p.nombre}" es ${p.stockMax}.`);
                        setTimeout(() => setError(''), 3000);
                        return { ...p, cantidad: p.stockMax };
                    }
                    return { ...p, cantidad: nuevaCantidad };
                }
                return p;
            })
        );
    };

    const calcularTotal = () => {
        return productosSeleccionados.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    };

    const handleSubmitVenta = async () => {
        if (productosSeleccionados.length === 0) {
            setError('Debes seleccionar al menos un producto para la venta.');
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);

        const ventaData = {
            // vendedorId se toma del token en el backend
            productos: productosSeleccionados.map(p => ({
                productoId: p.productoId,
                cantidad: p.cantidad
                // precioAlMomentoDeVenta y nombreProducto se añadirán en el backend
            })),
            // total se calcula en el backend
        };

        try {
            await api.post('/sales', ventaData);
            setSuccess('Venta registrada exitosamente.');
            setProductosSeleccionados([]); // Limpiar panel
            // TODO: Idealmente, se debería re-fetchear el stock de los productos afectados
            // o actualizarlo localmente si el backend devuelve los productos actualizados.
            // Por simplicidad, el usuario tendría que recargar o se podría añadir un botón de refresco.
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar la venta.');
            console.error(err);
        }
        setLoading(false);
    };

    const filteredProductosDisponibles = searchTerm
        ? productosDisponibles.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        : productosDisponibles;

    // Solo para Vendedores o Admin
    if (!user || (user.rol !== 'vendedor' && user.rol !== 'admin')) {
        return <p style={errorStyle}>No tienes permisos para acceder a esta sección.</p>;
    }

    return (
        <div style={panelStyle}>
            <h3>Registrar Nueva Venta</h3>
            {error && <p style={errorStyle}>{error}</p>}
            {success && <p style={successStyle}>{success}</p>}

            <div style={searchSectionStyle}>
                <input
                    type="text"
                    placeholder="Buscar producto para añadir..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...inputStyle, marginBottom: '5px' }}
                />
                {searchTerm && filteredProductosDisponibles.length > 0 && (
                    <ul style={productListStyle}>
                        {filteredProductosDisponibles.slice(0, 5).map(p => ( // Mostrar solo los primeros 5 resultados
                            <li key={p._id} onClick={() => handleAddProduct(p)} style={productListItemStyle}>
                                {p.nombre} (Stock: {p.stock}) - ${p.precio.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                )}
                 {searchTerm && filteredProductosDisponibles.length === 0 && <p>No se encontraron productos.</p>}
            </div>

            <h4>Productos en esta Venta:</h4>
            {productosSeleccionados.length === 0 ? (
                <p>Añade productos buscándolos arriba.</p>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Producto</th>
                            <th style={thStyle}>Cantidad (max: stock)</th>
                            <th style={thStyle}>Precio Unit.</th>
                            <th style={thStyle}>Subtotal</th>
                            <th style={thStyle}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosSeleccionados.map(p => (
                            <tr key={p.productoId}>
                                <td style={tdStyle}>{p.nombre}</td>
                                <td style={tdStyle}>
                                    <input
                                        type="number"
                                        value={p.cantidad}
                                        onChange={(e) => handleQuantityChange(p.productoId, e.target.value)}
                                        min="1"
                                        max={p.stockMax}
                                        style={{ ...inputStyle, width: '70px' }}
                                    /> (max: {p.stockMax})
                                </td>
                                <td style={tdStyle}>${p.precio.toFixed(2)}</td>
                                <td style={tdStyle}>${(p.precio * p.cantidad).toFixed(2)}</td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleRemoveProduct(p.productoId)} style={removeButtonStyle}>Quitar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={totalSectionStyle}>
                <h3>Total de la Venta: ${calcularTotal().toFixed(2)}</h3>
            </div>

            <button
                onClick={handleSubmitVenta}
                disabled={loading || productosSeleccionados.length === 0}
                style={submitButtonStyle}
                className="btn btn-success" // Usando clase global si existe
            >
                {loading ? 'Registrando Venta...' : 'Confirmar Venta'}
            </button>
        </div>
    );
};

// Estilos
const panelStyle = { padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#fff' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '10px' };
const errorStyle = { color: 'red', background: '#fdd', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' };
const successStyle = { color: 'green', background: '#dfd', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' };

const searchSectionStyle = { marginBottom: '20px', position: 'relative' };
const productListStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    position: 'absolute',
    backgroundColor: 'white',
    width: '100%',
    zIndex: 1000,
    maxHeight: '150px',
    overflowY: 'auto'
};
const productListItemStyle = {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee'
};
// productListItemStyle:hover { backgroundColor: '#f0f0f0' }

const tableStyle = { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' };
const thStyle = { border: '1px solid #ddd', padding: '8px', background: '#f7f7f7', textAlign: 'left' };
const tdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
const removeButtonStyle = { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

const totalSectionStyle = { marginTop: '20px', textAlign: 'right', fontSize: '1.2em' };
const submitButtonStyle = { padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', display: 'block', margin: '20px auto 0' };


export default PanelVentas;
