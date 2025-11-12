const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3000;

const MONGODB_URL = 'mongodb+srv://Shanthal11:shan110908.11@bibliotecajs.6cbjf2l.mongodb.net/?appName=BibliotecaJS';
mongoose.connect(MONGODB_URL)
 .then(() => console.log('MongoDB conectado'))
 .catch((err) => console.log(err));

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
  
    return mongoose.connection;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URL, {
    
    });
    console.log('MongoDB conectado:', conn.connection.host);
    return conn;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    throw err;
  }
}

// Esquema de reseña
const reseñas = mongoose.model('Reseña', {
  usuario: { type: String, required: true, default: 'Invitado' },
  titulo: { type: String, required: true },
  imagen: { type: String, default: 'img/placeholder.jpg' },
  texto: { type: String, required: true },
  level: { type: String, required: true },
  fecha: { type: Date, default: () => new Date() },
  calificacion: { type: Number, default: 0, min: 0, max: 5 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

app.post("/reseñas",(req,res) => {
  const nuevareseña = new reseñas(req.body);
  nuevareseña.save()
  .then(() => res.status(201).json({ message: 'Reseña creada exitosamente' }))
  .catch((err) => res.status(400).json({ error: err.message }));
  
})

module.exports = {
  mongoose,
  connectDB,
  Review,
  MONGODB_URL,
};