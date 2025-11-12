const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.json());

// CORS básico para permitir peticiones desde el frontend (Vite dev server)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'resenas.json');


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
    
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    return [];
  }
}

function writeReviews(list) {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
}



// Rutas API
app.get('/api/resenas', (req, res) => {
  const reseñas = readReviews();
  res.json(reseñas);
});

app.post('/api/resenas', (req, res) => {
  const body = req.body || {};
  const { usuario, titulo, imagen, texto, level, fecha, calificacion } = body;

  if (!titulo || !texto || !level) {
    return res.status(400).json({ error: 'Faltan campos requeridos: titulo, texto, level' });
  }

  const reseñas = readReviews();
  const nueva = {
    id: Date.now(),
    usuario: usuario && String(usuario).trim() ? usuario : 'Invitado',
    titulo,
    imagen: imagen || 'img/placeholder.jpg',
    texto,
    level,
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

// Editar reseña (titulo, texto, imagen, calificacion, level)
app.put('/api/resenas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imagen, calificacion, level } = req.body || {};
  if (!titulo && !texto && !level) {
    return res.status(400).json({ error: 'Faltan campos requeridos: titulo, texto, level' });
  }
  const reseñas = readReviews();
  const idx = reseñas.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Reseña no encontrada' });

  if (typeof titulo === 'string') reseñas[idx].titulo = titulo;
  if (typeof texto === 'string') reseñas[idx].texto = texto;
  if (typeof imagen === 'string' && imagen.length) reseñas[idx].imagen = imagen;
  if (calificacion !== undefined) reseñas[idx].calificacion = Number(calificacion) || 0;
  if (typeof level === 'string') reseñas[idx].level = level;

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


app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Rutas de usuarios eliminadas para un proyecto sin autenticación

// Usar puerto 3001 para coincidir con el frontend que llama a http://localhost:3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

  
