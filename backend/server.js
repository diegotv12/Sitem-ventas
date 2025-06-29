const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

// Cargar variables de entorno desde .env
dotenv.config();

// Conectar a MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({ // Configurar CORS apropiadamente para tu frontend en producción
    origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'URL_DEL_FRONTEND_EN_PRODUCCION',
    credentials: true // Necesario si envías cookies
}));
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded
app.use(cookieParser()); // Para parsear cookies

// Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes); // Usando /api/sales
app.use('/api/dashboard', dashboardRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API del Sistema de Ventas funcionando...');
});

// Middleware para manejo de errores (básico, se puede expandir)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

// Manejo de promesas no capturadas (opcional pero recomendado)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Error: ${err.message}`);
    // Cerrar servidor y salir (opcional)
    // server.close(() => process.exit(1));
});
