const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || '';

async function connectDB() {
  if (!MONGODB_URL) throw new Error('MONGODB_URL no está configurado');
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const conn = await mongoose.connect(MONGODB_URL);
  return conn;
}

const ResenaSchema = new mongoose.Schema({
  usuario: { type: String, required: true, default: 'Invitado' },
  titulo: { type: String, required: true },
  imagen: { type: String, default: 'img/placeholder.jpg' },
  texto: { type: String, required: true },
  level: { type: String, required: true },
  fecha: { type: Date, default: () => new Date() },
  calificacion: { type: Number, default: 0, min: 0, max: 5 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

const Resena = mongoose.model('Reseña', ResenaSchema);

module.exports = {
  mongoose,
  connectDB,
  Resena,
};
