const mongoose = require('mongoose');
require('dotenv').config(); // Asegura que las variables de .env estén disponibles

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            console.error('Error: MONGO_URI no está definida en el archivo .env');
            process.exit(1);
        }

        await mongoose.connect(mongoURI, {
            // Opciones de Mongoose para evitar warnings de deprecación.
            // Algunas de estas pueden no ser necesarias con versiones recientes de Mongoose.
            // useNewUrlParser: true, // No longer necessary
            // useUnifiedTopology: true, // No longer necessary
            // useCreateIndex: true, // No longer supported
            // useFindAndModify: false // No longer necessary
        });
        console.log('MongoDB Conectado...');
    } catch (err) {
        console.error('Error al conectar con MongoDB:', err.message);
        // Salir del proceso con fallo
        process.exit(1);
    }
};

module.exports = connectDB;
