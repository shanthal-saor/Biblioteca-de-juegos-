import React from 'react'
import './index.css'
const FRONTEND_DIR = '/src/pages/';
const port = 3000;
export default function HomePage() {  // Componente HomePage, componente principal de la página de inicio

  return ( 
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col arcade-bg">
      <header className="w-full flex justify-between items-center px-10 py-6">

        <h1 className="text-3xl font-extrabold tracking-tight">NeonPlaybook</h1>
        
        <nav className="flex gap-8 text-lg font-medium">
          <a href={'/'} className="active hover:text-purple-300 transition">Hogar</a>
          <a href={FRONTEND_DIR + 'inicio/inicio.html'} className="hover:text-purple-300 transition">Inicio</a>
          <a href={FRONTEND_DIR + 'reseñas/reseñas.html'} className="hover:text-purple-300 transition">Reseñas</a>
          <a href={FRONTEND_DIR + 'Biblioteca/biblioteca.html'} className="hover:text-purple-300 transition">Biblioteca</a>
          <a href={FRONTEND_DIR + 'login/login.html'} className="hover:text-purple-300 transition">Login</a>
           <link rel="stylesheet" href="logo.png"></link>
        </nav>
      </header>

      <div className="arcade-wrapper">
        <div className="arcade-marquee">NeonPlaybook</div>
        <div className="arcade-screen">
          <div className="arcade-title">Press Start</div>
          <div className="arcade-progress"><div className="arcade-progress-bar" style={{width:'42%'}}></div></div>
        </div>
        <div className="arcade-controls">
          <div className="joystick">
            <div className="stick"></div>
            <div className="base"></div>
          </div>
          <button className="arcade-btn pink">Start</button>
          <button className="arcade-btn yellow">Select</button>
          <button className="arcade-btn cyan">A</button>
          <button className="arcade-btn cyan">B</button>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-extrabold mb-6">Bienvenido a NeonPlaybook</h1>
        <p className="max-w-2xl text-lg opacity-90 leading-relaxed mb-10">
          Un espacio creado para los jugadores que buscan compartir sus opiniones, descubrir nuevos títulos y guardar sus juegos favoritos. 
          Aquí podrás dejar tu huella en la comunidad gamer, reseñar, opinar y explorar el vasto universo del gaming, todo bajo un ambiente iluminado por el brillo del neón morado.
        </p>

        {/* Ilustración del zorro */}
        <div className="w-96 h-96 rounded-3xl bg-gradient-to-tr from-purple-600 to-purple-400 p-8 shadow-2xl transform hover:rotate-1 transition-all">
          <svg viewBox="0 0 420 420 " xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="fur" x1="0" x2="1">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="50%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <g transform="translate(10,10)" filter="url(#glow)">
              <circle cx="200" cy="200" r="160" fill="rgba(255,255,255,0.02)" />
              <path d="M200 110 C240 110 300 140 310 190 C320 240 280 270 250 280 C220 290 180 290 150 280 C120 270 80 240 90 190 C100 140 160 110 200 110 Z" fill="url(#fur)"/>
              <path d="M200 80 C230 80 260 100 270 120 C280 140 275 160 260 170 C240 180 220 175 200 170 C180 175 160 180 140 170 C125 160 120 140 130 120 C140 100 170 80 200 80 Z" fill="#fff8" />
              <path d="M140 95 L110 50 L170 90 Z" fill="#ffedd5" opacity="0.9"/>
              <path d="M260 95 L300 50 L230 90 Z" fill="#ffedd5" opacity="0.9"/>
              <ellipse cx="185" cy="150" rx="10" ry="6" fill="#0f172a" />
              <ellipse cx="215" cy="150" rx="10" ry="6" fill="#0f172a" />
              <path d="M310 260 C360 230 380 300 320 320 C330 300 300 280 310 260 Z" fill="#fff6" />
              <circle cx="200" cy="200" r="180" fill="none" stroke="#A78BFA" strokeOpacity="0.06" strokeWidth="24" />
            </g>
          </svg>
        </div>
      </main>

      <section className="w-full bg-purple-950 py-10 px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition">
          <img src="https://i.pinimg.com/736x/e0/91/c4/e091c408c0a5788e4d81c6bcdfc24e3b.jpg" alt="imagen 1" className="w-full h-60 object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition">
          <img src="https://i.pinimg.com/736x/d4/dc/14/d4dc143abba2b4adc7fb660463a381b5.jpg" alt="imagen 2" className="w-full h-60 object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition">
          <img src="https://i.pinimg.com/1200x/3b/5d/11/3b5d11d438f6b2895a6d82dc4fe7677e.jpg" alt="imagen 3" className="w-full h-60 object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition">
          <img src="https://i.pinimg.com/736x/e5/96/20/e596202e573beb0f88e0bedfbe019f3e.jpg" alt="imagen 4" className="w-full h-60 object-cover" />
        </div>
      </section>

      <footer className="py-6 text-center text-sm opacity-80">
        © {new Date().getFullYear()} NeonPlaybook — Creado para los gamers apasionados.
      </footer>
    </div>
  );
}
