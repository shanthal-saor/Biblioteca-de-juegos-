// Crear nuevas colecciones usando el botón flotante
addGameBtn.addEventListener('click', () => {
  const nombre = prompt('🎮 Escribe el nombre de la colección a crear:');
  if (nombre && nombre.trim() !== '') {
    crearColeccion(nombre.trim());
    renderizarColecciones();
  } else {
    alert('⚠️ No se creó ninguna colección.');
  }
});

// Búsqueda: filtra tarjetas por texto del título
function buscar() {
  const q = (document.getElementById('search')?.value || '').toLowerCase();
  const cards = gamesSection.querySelectorAll('.game-card');
  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
    card.style.display = title.includes(q) ? '' : 'none';
  });
}