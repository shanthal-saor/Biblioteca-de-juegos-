// Backend API para reseñas
// Servidor Express con persistencia simple en archivo JSON

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// CORS básico para permitir peticiones desde el frontend (Vite dev server)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Ubicación del archivo de datos
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'resenas.json');
// Autenticación eliminada: ya no se usa archivo de usuarios

// Asegurar que el directorio y archivo existan
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readReviews() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    // Si hay error leyendo o parseando, re-inicializar
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    return [];
  }
}

function writeReviews(list) {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

// Funciones de usuarios eliminadas

// Rutas API
app.get('/api/resenas', (req, res) => {
  const reseñas = readReviews();
  res.json(reseñas);
});

app.post('/api/resenas', (req, res) => {
  const body = req.body || {};
  const { usuario, titulo, imagen, texto, fecha, calificacion } = body;

  if (!titulo || !texto) {
    return res.status(400).json({ error: 'Faltan campos requeridos: titulo, texto' });
  }

  const reseñas = readReviews();
  const nueva = {
    id: Date.now(),
    usuario: usuario && String(usuario).trim() ? usuario : 'Invitado',
    titulo,
    imagen: imagen || 'img/placeholder.jpg',
    texto,
    fecha: fecha || new Date().toISOString(),
    calificacion: calificacion !== undefined ? Number(calificacion) || 0 : 0,
    likes: Number(body.likes) || 0,
  };

  reseñas.push(nueva);
  writeReviews(reseñas);
  res.status(201).json(nueva);
});

app.put('/api/resenas/:id/likes', (req, res) => {
  const { id } = req.params;
  const { likes } = req.body || {};
  const reseñas = readReviews();
  const idx = reseñas.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Reseña no encontrada' });
  reseñas[idx].likes = Number(likes) || 0;
  writeReviews(reseñas);
  res.json({ id: reseñas[idx].id, likes: reseñas[idx].likes });
});

// Editar reseña (titulo, texto, imagen, calificacion)
app.put('/api/resenas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imagen, calificacion } = req.body || {};
  const reseñas = readReviews();
  const idx = reseñas.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Reseña no encontrada' });

  if (typeof titulo === 'string') reseñas[idx].titulo = titulo;
  if (typeof texto === 'string') reseñas[idx].texto = texto;
  if (typeof imagen === 'string' && imagen.length) reseñas[idx].imagen = imagen;
  if (calificacion !== undefined) reseñas[idx].calificacion = Number(calificacion) || 0;

  writeReviews(reseñas);
  res.json(reseñas[idx]);
});

// Eliminar reseña
app.delete('/api/resenas/:id', (req, res) => {
  const { id } = req.params;
  const reseñas = readReviews();
  const idx = reseñas.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Reseña no encontrada' });
  const [eliminada] = reseñas.splice(idx, 1);
  writeReviews(reseñas);
  res.json({ ok: true, id: eliminada.id });
});

// Salud
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Rutas de usuarios eliminadas para un proyecto sin autenticación

// Usar puerto 3001 para coincidir con el frontend que llama a http://localhost:3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

  
