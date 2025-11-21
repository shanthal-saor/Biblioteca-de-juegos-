const API_BASE = 'http://localhost:3000'
let allGames = []

function normalizeGame(g) {
  // Normaliza estructura de juego para el front
  return {
    id: g.id,
    titulo: g.titulo || g.name || 'Sin título',
    cover: g.cover || g.image || '',
    genero: g.genero || g.genre || '',
    fecha: g.fecha || g.Fechadecreaccion || '',
    compania: g.compania || g.company || '',
    descripcion: g.descripcion || g.description || '',
    plataformas: Array.isArray(g.plataformas) ? g.plataformas : [],
  }
}

async function fetchJuegos() {
  // GET juegos del backend
  try {
    const res = await fetch(`${API_BASE}/api/juegos`)
    if (!res.ok) throw new Error('No se pudo cargar juegos')
    const data = await res.json()
    return Array.isArray(data) ? data.map(normalizeGame) : []
  } catch (e) {
    console.error(e)
    return []
  }
}

function createCard(game) {
  // Crea tarjeta arcade y vincula el detalle
  const card = document.createElement('div')
  card.className = 'game-card arcade-card'
  card.setAttribute('data-id', game.id)

  card.innerHTML = `
    <div class="card-preview">
      <img src="${game.cover}" alt="${game.titulo}" onerror="this.src='https://via.placeholder.com/280x160?text=No+Image'" />
      <h3 class="title">${game.titulo}</h3>
    </div>
  `

  const preview = card.querySelector('.card-preview')
  preview.addEventListener('click', () => {
    showDetail(game, card)
  })

  return card
}

let detailOverlay
let overlayAnchor

function ensureDetailOverlay() {
  // Crea popover reutilizable para detalle de juego
  if (!detailOverlay) {
    detailOverlay = document.createElement('div')
    detailOverlay.className = 'detail-popover arcade-card'
    document.body.appendChild(detailOverlay)
    detailOverlay.style.display = 'none'
  }
  return detailOverlay
}

function hideDetail() {
  // Oculta y limpia el popover
  const el = ensureDetailOverlay()
  el.style.display = 'none'
  el.innerHTML = ''
  overlayAnchor = null
}

function showDetail(game, anchor) {
  // Muestra detalle del juego y botón de Ver reseñas
  const el = ensureDetailOverlay()
  overlayAnchor = anchor
  const rect = anchor.getBoundingClientRect()
  el.style.position = 'absolute'
  el.style.left = `${rect.left + window.scrollX}px`
  el.style.top = `${rect.top + window.scrollY}px`
  el.style.width = `${rect.width}px`
  el.innerHTML = `
    <div class="expanded-grid">
      <div class="expanded-cover">
        <img src="${game.cover}" alt="${game.titulo}" onerror="this.src='https://via.placeholder.com/420x240?text=No+Image'" />
      </div>
      <div class="expanded-info">
        <h3>${game.titulo}</h3>
        <p><strong>Género:</strong> ${game.genero || 'N/D'}</p>
        <p><strong>Fecha:</strong> ${game.fecha || 'N/D'}</p>
        <p><strong>Compañía:</strong> ${game.compania || 'N/D'}</p>
        ${game.plataformas.length ? `<p><strong>Plataformas:</strong> ${game.plataformas.join(', ')}</p>` : ''}
        <p class="descripcion">${game.descripcion || ''}</p>
        <button class="reviews-btn">Ver reseñas</button>
        <div class="reviews-panel"></div>
      </div>
    </div>
  `
  el.style.display = 'block'

  const reviewsBtn = el.querySelector('.reviews-btn')
  const reviewsPanel = el.querySelector('.reviews-panel')
  if (reviewsBtn && reviewsPanel) {
    reviewsBtn.addEventListener('click', async () => {
      const items = await loadGameReviews(game.titulo)
      reviewsPanel.innerHTML = items.map(renderReviewItem).join('') || '<div class="no-reviews">Sin reseñas</div>'
      reviewsPanel.style.display = 'block'
    })
  }
}

document.addEventListener('click', (e) => {
  const el = ensureDetailOverlay()
  if (el.style.display !== 'none') {
    if (!el.contains(e.target) && (!overlayAnchor || !overlayAnchor.contains(e.target))) {
      hideDetail()
    }
  }
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideDetail()
})

async function loadGameReviews(titulo) {
  // GET reseñas y filtrado por título exacto
  try {
    const res = await fetch(`${API_BASE}/api/resenas`)
    if (!res.ok) return []
    const list = await res.json()
    return list.filter(r => (r.titulo || '').toLowerCase() === (titulo || '').toLowerCase())
  } catch (_) { return [] }
}

function renderReviewItem(r) {
  // Render de ítem de reseña dentro del panel del popover
  const stars = '★'.repeat(r.calificacion || 0) + '☆'.repeat(5 - (r.calificacion || 0))
  const when = formatRelative(r.createdAt, r.fecha, r.hora)
  const user = r.usuario || 'Anónimo'
  return `<div class="review-item"><div class="header"><span class="user">${user}</span><span class="time">${when}</span></div><div class="stars">${stars}</div><div class="opinion">${r.texto || ''}</div></div>`
}

function formatRelative(createdAt, fecha, hora) {
  // Cálculo de tiempo relativo: hoy/ayer/fecha
  const now = new Date()
  if (createdAt) {
    const dt = new Date(createdAt)
    const diff = now.getTime() - dt.getTime()
    const day = 24 * 60 * 60 * 1000
    if (diff < day) return `hoy a ${hora || dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    if (diff < 2 * day) return 'ayer'
    return dt.toLocaleDateString('es-ES')
  }
  return fecha || ''
}

async function renderJuegos() {
  // Render de grilla y sugerencias según búsqueda
  const container = document.querySelector('.cards-container') || document.querySelector('.games-grid')
  if (!container) return
  if (!allGames.length) allGames = await fetchJuegos()
  const queryEl = document.getElementById('search')
  const q = (queryEl && queryEl.value) ? queryEl.value.trim().toLowerCase() : ''
  const filtered = q
    ? allGames.filter(g => g.titulo.toLowerCase().startsWith(q))
    : allGames
  container.innerHTML = ''
  filtered.forEach(j => container.appendChild(createCard(j)))
  renderSearchSuggestions(q)
}

document.addEventListener('DOMContentLoaded', () => {
  renderJuegos()
  const input = document.getElementById('search')
  if (input) {
    input.addEventListener('input', () => renderJuegos())
  }
})

function ensureSuggestionsContainer() {
  // Contenedor flotante de sugerencias en la cabecera
  const header = document.querySelector('.header')
  if (!header) return null
  let box = header.querySelector('.search-suggestions')
  if (!box) {
    box = document.createElement('div')
    box.className = 'search-suggestions'
    header.appendChild(box)
  }
  return box
}

function renderSearchSuggestions(q) {
  // Renderiza coincidencias por texto en la cabecera
  const box = ensureSuggestionsContainer()
  if (!box) return
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; return }
  const matches = allGames
    .filter(g => g.titulo.toLowerCase().includes(q))
    .slice(0, 6)
  box.innerHTML = matches.map(m => `<div class="suggestion-item" data-id="${m.id}">${m.titulo}</div>`).join('')
  box.style.display = matches.length ? 'block' : 'none'
  box.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const input = document.getElementById('search')
      if (input) input.value = el.textContent
      renderJuegos()
    })
  })
}

function buscar() {
  renderJuegos()
}

// === Inicio (JS)
// Función: mostrar catálogo con popover detalle y panel de reseñas
// Componentes: auth local, tarjetas arcade, popover detalle, sugerencias de búsqueda


