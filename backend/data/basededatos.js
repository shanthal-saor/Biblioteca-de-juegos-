// Configuración de Mongoose y conexión a MongoDB
const mongoose = require('mongoose');

// Usa variable de entorno MONGODB_URI si está presente, si no usa local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neonplaybook';

mongoose.set('strictQuery', true);

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    // Ya conectado
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // opciones modernas por defecto en Mongoose 7+
    });
    console.log('MongoDB conectado:', conn.connection.host);
    return conn;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    throw err;
  }
}

// Ejemplo de esquema para reseñas (no utilizado aún en server.js)
// Se deja preparado para una futura migración desde archivo JSON a MongoDB.
const reviewSchema = new mongoose.Schema({
  usuario: { type: String, default: 'Invitado' },
  titulo: { type: String, required: true },
  imagen: { type: String, default: 'img/placeholder.jpg' },
  texto: { type: String, required: true },
  fecha: { type: Date, default: () => new Date() },
  calificacion: { type: Number, default: 0, min: 0, max: 5 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

module.exports = {
  mongoose,
  connectDB,
  Review,
  MONGODB_URI,
};