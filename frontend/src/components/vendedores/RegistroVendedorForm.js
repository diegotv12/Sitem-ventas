import React, { useState, useContext } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Para verificar si el usuario es admin
import MapaSelector from '../common/MapaSelector'; // Importar MapaSelector

const RegistroVendedorForm = () => {
    const { user } = useAuth(); // Obtener el usuario actual para verificar si es admin
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        negocio: '',
        lat: '',
        lng: '',
        fotosBase64: [] // Array para almacenar strings base64 de las imágenes
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    const { nombre, email, password, telefono, negocio, lat, lng } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limitar cantidad o tamaño de archivos si es necesario
        if (files.length > 5) {
            setError("Puedes subir un máximo de 5 fotos.");
            return;
        }
        setError('');

        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                // Validar tipo de archivo (opcional)
                if (!file.type.startsWith('image/')) {
                    reject(new Error("Solo se permiten archivos de imagen."));
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        });

        Promise.all(promises)
            .then(base64results => {
                setFormData(prev => ({ ...prev, fotosBase64: [...prev.fotosBase64, ...base64results] }));
            })
            .catch(err => {
                console.error("Error al convertir archivos a base64:", err);
                setError(err.message || "Error al procesar las imágenes.");
            });
    };

    const removeFoto = (index) => {
        setFormData(prev => ({
            ...prev,
            fotosBase64: prev.fotosBase64.filter((_, i) => i !== index)
        }));
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            setGettingLocation(true);
            setError('');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString(),
                    });
                    setGettingLocation(false);
                },
                (err) => {
                    console.error("Error obteniendo geolocalización:", err);
                    setError(`Error obteniendo ubicación: ${err.message}. Asegúrate de haber dado permisos.`);
                    setGettingLocation(false);
                },
                { timeout: 10000 } // Timeout de 10 segundos
            );
        } else {
            setError("Geolocalización no es soportada por este navegador.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user || user.rol !== 'admin') {
            setError("Acción no autorizada. Debes ser administrador.");
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = {
                nombre,
                email,
                password,
                telefono,
                negocio,
                ubicacion: { lat: parseFloat(lat) || undefined, lng: parseFloat(lng) || undefined },
                fotos: formData.fotosBase64, // Enviar array de strings base64
            };

            // Validar que lat y lng sean números si se proporcionan
            if ((lat && isNaN(parseFloat(lat))) || (lng && isNaN(parseFloat(lng)))) {
                setError("Latitud y Longitud deben ser números válidos.");
                setLoading(false);
                return;
            }

            await api.post('/users/registrar-vendedor', dataToSubmit);
            setSuccess('Vendedor registrado exitosamente.');
            // Limpiar formulario
            setFormData({
                nombre: '', email: '', password: '', telefono: '',
                negocio: '', lat: '', lng: '', fotosBase64: []
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar vendedor.');
        }
        setLoading(false);
    };

    // Solo renderizar el formulario si el usuario es admin
    if (!user || user.rol !== 'admin') {
        return <p style={errorStyle}>No tienes permisos para acceder a esta sección.</p>;
    }

    return (
        <div style={formContainerStyle}>
            <h3>Formulario de Registro de Vendedor</h3>
            {error && <p style={errorStyle}>{error}</p>}
            {success && <p style={successStyle}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div style={inputGroupStyle}>
                    <label>Nombre Completo:</label>
                    <input type="text" name="nombre" value={nombre} onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                    <label>Email:</label>
                    <input type="email" name="email" value={email} onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                    <label>Contraseña (mín. 6 caracteres):</label>
                    <input type="password" name="password" value={password} onChange={handleChange} required minLength="6" style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                    <label>Teléfono:</label>
                    <input type="tel" name="telefono" value={telefono} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={inputGroupStyle}>
                    <label>Nombre del Negocio:</label>
                    <input type="text" name="negocio" value={negocio} onChange={handleChange} style={inputStyle} />
                </div>

                <h4>Ubicación:</h4>
                <div style={inputGroupStyle}>
                    <button type="button" onClick={handleGetCurrentLocation} disabled={gettingLocation} style={locationButtonStyle}>
                        {gettingLocation ? 'Obteniendo...' : 'Usar Ubicación Actual'}
                    </button>
                </div>
                <div style={coordsGroupStyle}>
                    <div style={coordInputStyle}>
                        <label>Latitud:</label>
                        <input type="text" name="lat" value={lat} onChange={handleChange} placeholder="Ej: 40.7128" style={inputStyle} />
                    </div>
                    <div style={coordInputStyle}>
                        <label>Longitud:</label>
                        <input type="text" name="lng" value={lng} onChange={handleChange} placeholder="Ej: -74.0060" style={inputStyle} />
                    </div>
                </div>

                {/* Integración del Mapa Selector */}
                <MapaSelector
                    initialPosition={lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null}
                    onLocationSelect={(selectedLocation) => {
                        setFormData(prev => ({
                            ...prev,
                            lat: selectedLocation.lat.toString(),
                            lng: selectedLocation.lng.toString()
                        }));
                    }}
                    height="300px"
                />

                <h4>Fotos del Negocio/Vendedor (opcional, máx. 5):</h4>
                <div style={inputGroupStyle}>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={inputStyle} />
                </div>
                {formData.fotosBase64.length > 0 && (
                    <div style={previewContainerStyle}>
                        <p>Previsualización de imágenes:</p>
                        {formData.fotosBase64.map((fotoSrc, index) => (
                            <div key={index} style={imagePreviewWrapperStyle}>
                                <img src={fotoSrc} alt={`preview ${index}`} style={imagePreviewStyle} />
                                <button type="button" onClick={() => removeFoto(index)} style={removeButtonStyle}>X</button>
                            </div>
                        ))}
                    </div>
                )}

                <button type="submit" disabled={loading || gettingLocation} style={submitButtonStyle} className="btn btn-primary">
                    {loading ? 'Registrando...' : 'Registrar Vendedor'}
                </button>
            </form>
        </div>
    );
};

// Estilos (pueden ir a un archivo CSS)
const formContainerStyle = { maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' };
const inputGroupStyle = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };
const coordsGroupStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' };
const coordInputStyle = { width: '48%' };
const mapPlaceholderStyle = { padding: '20px', border: '1px dashed #ccc', textAlign: 'center', marginBottom: '15px', backgroundColor: '#f9f9f9' };
const locationButtonStyle = { padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' };
const submitButtonStyle = { padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' };
const errorStyle = { color: 'red', background: '#fdd', padding: '10px', borderRadius: '4px', marginBottom: '15px' };
const successStyle = { color: 'green', background: '#dfd', padding: '10px', borderRadius: '4px', marginBottom: '15px' };

const previewContainerStyle = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' };
const imagePreviewWrapperStyle = { position: 'relative', width: '100px', height: '100px' };
const imagePreviewStyle = { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' };
const removeButtonStyle = { position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', lineHeight: '1' };

export default RegistroVendedorForm;
