import axios from 'axios';

// Determinar la URL base de la API según el entorno
// En desarrollo, el backend suele estar en un puerto diferente (ej. 5000)
// En producción, el frontend y backend podrían estar bajo el mismo dominio.
const API_URL = process.env.NODE_ENV === 'development'
                ? 'http://localhost:5000/api' // URL del backend en desarrollo
                : '/api'; // URL relativa en producción (asumiendo mismo host o proxy)

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true, // Descomentar si usas cookies HttpOnly directamente y necesitas enviarlas
});

// Interceptor para añadir el token JWT a las cabeceras de las solicitudes
// Esto se hace aquí o en AuthContext al cargar el usuario.
// Si se hace en AuthContext, este interceptor podría no ser necesario para el token,
// pero puede ser útil para otras cosas (manejo de errores global, etc.).
// Por consistencia con cómo se configuró AuthContext (actualiza api.defaults),
// este interceptor es redundante para el token si AuthContext siempre se carga primero.
// Sin embargo, es una práctica común tenerlo.

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !config.headers['Authorization']) { // Añadir solo si no está ya (puesto por AuthContext)
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta (opcional pero útil)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // El servidor respondió con un estado fuera del rango 2xx
            console.error('Error de API:', error.response.data);

            if (error.response.status === 401) {
                // No autorizado (ej. token inválido/expirado)
                // Podríamos desloguear al usuario aquí si el token no se puede refrescar
                // localStorage.removeItem('token');
                // delete api.defaults.headers.common['Authorization'];
                // window.location.href = '/login'; // Forzar redirección
                // O emitir un evento que AuthContext pueda escuchar
                console.warn('Error 401: No autorizado. El token puede ser inválido o haber expirado.');
            }
            // Otros manejos de error (403, 404, 500, etc.)
        } else if (error.request) {
            // La solicitud se hizo pero no se recibió respuesta
            console.error('Error de red o sin respuesta del servidor:', error.request);
        } else {
            // Algo sucedió al configurar la solicitud que provocó un error
            console.error('Error de configuración de Axios:', error.message);
        }
        return Promise.reject(error); // Importante: propagar el error para que el catch del caller lo maneje
    }
);

export default api;
