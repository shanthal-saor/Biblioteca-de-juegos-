import React from 'react'
import './index.css'

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'Poppins, sans-serif', color: '#f2f2f2', background: '#0f0f10', minHeight: '100vh' }}>
      <h1 style={{ color: '#9c7cff' }}>NeonPlaybook</h1>
      <p>Bienvenido. Usa los enlaces para navegar por las páginas multipágina del sitio:</p>
      <nav style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <a href="/pages/Entrada/entrada.html" style={linkStyle}>Hogar</a>
        <a href="/pages/inicio/inicio.html" style={linkStyle}>Inicio</a>
        <a href="/pages/reseñas/reseñas.html" style={linkStyle}>Reseñas</a>
        <a href="/pages/Biblioteca/biblioteca.html" style={linkStyle}>Biblioteca</a>
      </nav>
    </div>
  )
}

const linkStyle = {
  background: '#1a1b22',
  color: '#fff',
  textDecoration: 'none',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #2a2b33'
}