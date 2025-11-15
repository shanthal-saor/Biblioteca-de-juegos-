const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const router = require('./router/index.js')
const PORT = process.env.PORT || 3000

app.use(router)

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`)
});

  
