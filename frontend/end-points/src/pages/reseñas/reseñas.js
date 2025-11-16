// === Reseñas (JS)
// Función: crear, listar y editar reseñas; sugerencias de juegos
// Componentes: formulario con estrellas, lista de reseñas, modal edición, sugerencias de juego
const API_BASE = 'http://localhost:3000'
const form = document.getElementById('reviewForm');
const lista = document.getElementById('listaReseñas');

// SISTEMA DE CALIFICACIÓN CON ESTRELLAS
let calificacionSeleccionada = 0;
const starRating = document.getElementById('star-rating');
const ratingText = document.getElementById('rating-text');
const stars = starRating ? starRating.querySelectorAll('.star') : [];

// Función para actualizar las estrellas visuales
function actualizarEstrellas(rating) {
  stars.forEach((star, index) => {
    star.classList.toggle('selected', index < rating);
    star.classList.remove('hover');
  });
}

// Función para actualizar el texto de calificación
function actualizarTextoCalificacion(rating) {
  const textos = ['Pésimo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
  ratingText.textContent = rating > 0 ? `${rating}/5 - ${textos[rating - 1]}` : 'Sin calificación';
  
  // Añadir efecto de confirmación
  if (rating > 0) {
    ratingText.style.color = '#ffd700';
    ratingText.style.fontWeight = 'bold';
    setTimeout(() => {
      ratingText.style.color = '#aaa';
      ratingText.style.fontWeight = 'normal';
    }, 1000);
  }
}

// Eventos de interacción en estrellas
if (stars.length) {
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      calificacionSeleccionada = index + 1;
      localStorage.setItem('calificacionTemporal', calificacionSeleccionada);
      actualizarEstrellas(calificacionSeleccionada);
      actualizarTextoCalificacion(calificacionSeleccionada);
    });

    star.addEventListener('mouseenter', () => {
      actualizarEstrellas(index + 1);
      stars.forEach((s, i) => {
        if (i <= index) s.classList.add('hover');
      });
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
      actualizarEstrellas(calificacionSeleccionada);
    });
  });

  if (starRating) {
    starRating.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
      actualizarEstrellas(calificacionSeleccionada);
    });
  }
}

// Restaurar calificación al cargar la página
window.addEventListener('load', () => {
  const calificacionGuardada = localStorage.getItem('calificacionTemporal');
  if (calificacionGuardada) {
    calificacionSeleccionada = parseInt(calificacionGuardada);
    actualizarEstrellas(calificacionSeleccionada);
    actualizarTextoCalificacion(calificacionSeleccionada);
  }
});

document.addEventListener('DOMContentLoaded', cargarReseñas);
document.addEventListener('DOMContentLoaded', initGameSuggestions);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  try { cargarReseñas() } catch {}
  try { initGameSuggestions() } catch {}
}

// FORMULARIO DE RESEÑAS
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Nombre de usuario desde formulario; si no hay, usar activo o 'Invitado'
  const usuario = (document.getElementById('nombreUsuario')?.value.trim()) || localStorage.getItem('usuarioActivo') || 'Invitado';

  if (calificacionSeleccionada === 0) {
    alert('Por favor selecciona una calificación de 1 a 5 estrellas.');
    return;
  }

  const titulo = document.getElementById('tituloJuego').value.trim();
  const imagen = document.getElementById('imagenJuego').value.trim() || 'img/placeholder.jpg';
  const texto = document.getElementById('textoReseña').value.trim();
  const level = document.getElementById('nivelDificultad') ? document.getElementById('nivelDificultad').value : 'intermedio';
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const reseña = { 
    usuario, 
    titulo, 
    imagen, 
    texto, 
    level,
    fecha, 
    hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now(),
    calificacion: calificacionSeleccionada,
    likes: 0
  };

  const creada = await guardarReseña(reseña);
  if (creada) {
    mostrarReseña(creada);
    form.reset();
    // Resetear calificación
    calificacionSeleccionada = 0;
    actualizarEstrellas(0);
    actualizarTextoCalificacion(0);
    localStorage.removeItem('calificacionTemporal');
    
    // Mostrar mensaje de éxito
    alert('¡Reseña publicada exitosamente con calificación de ' + creada.calificacion + ' estrellas!');
  }
});

// POST reseña (con fallback a LocalStorage)
async function guardarReseña(r) {
  try {
    const resp = await fetch(`${API_BASE}/api/resenas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    if (!resp.ok) throw new Error('Error al guardar reseña');
    return await resp.json();
  } catch (e) {
    const reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];
    const conId = { id: Date.now(), likes: 0, ...r };
    reseñas.push(conId);
    localStorage.setItem('reseñas', JSON.stringify(reseñas));
    return conId;
  }
}

// GET reseñas (con fallback)
async function cargarReseñas() {
  try {
    const resp = await fetch(`${API_BASE}/api/resenas`);
    if (!resp.ok) throw new Error('Error al obtener reseñas');
    const reseñas = await resp.json();
    reseñas.forEach(mostrarReseña);
  } catch (e) {
    const reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];
    reseñas.forEach(mostrarReseña);
  }
}

let juegosCache = []
let editingReviewId = null
let editCalificacion = 0
// GET catálogo de juegos para sugerencias
async function fetchJuegosCatalogo() {
  try {
    const resp = await fetch(`${API_BASE}/api/juegos`)
    if (!resp.ok) throw new Error('Error al obtener juegos')
    const data = await resp.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    return []
  }
}

// Crea/inserta contenedor de sugerencias junto al input de juego
function ensureGameSuggestionBox(input) {
  let wrapper = input.parentElement
  if (!wrapper.classList.contains('game-input-wrapper')) {
    const newWrapper = document.createElement('div')
    newWrapper.className = 'game-input-wrapper'
    wrapper.insertBefore(newWrapper, input)
    newWrapper.appendChild(input)
    wrapper = newWrapper
  }
  let box = wrapper.querySelector('.game-suggestions')
  if (!box) {
    box = document.createElement('div')
    box.className = 'game-suggestions'
    wrapper.appendChild(box)
  }
  return box
}

// Renderiza lista de sugerencias con miniatura
function renderGameSuggestions(input, q) {
  const box = ensureGameSuggestionBox(input)
  const query = q.trim().toLowerCase()
  if (!query) { box.innerHTML = ''; box.style.display = 'none'; return }
  const candidates = juegosCache.filter(g => {
    const name = (g.titulo || g.name || '').toLowerCase()
    return name.startsWith(query) || name.includes(query)
  })
  const matches = candidates
    .sort((a, b) => {
      const na = (a.titulo || a.name || '').toLowerCase()
      const nb = (b.titulo || b.name || '').toLowerCase()
      const sa = na.startsWith(query) ? 0 : 1
      const sb = nb.startsWith(query) ? 0 : 1
      return sa - sb || na.localeCompare(nb)
    })
    .slice(0, 8)
  box.innerHTML = matches.map(m => {
    const title = m.titulo || m.name || ''
    const img = m.cover || m.image || ''
    return `<div class="game-suggestion-item">
      <img src="${img}" alt="${title}" onerror="this.src='https://via.placeholder.com/48x48?text='" />
      <span>${title}</span>
    </div>`
  }).join('')
  box.style.display = matches.length ? 'block' : 'none'
  box.querySelectorAll('.game-suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const title = el.querySelector('span').textContent
      input.value = title
      box.style.display = 'none'
    })
  })
}

// Inicializa caché y listeners de sugerencias
async function initGameSuggestions() {
  juegosCache = await fetchJuegosCatalogo()
  const input = document.getElementById('tituloJuego')
  if (!input) return
  input.addEventListener('input', () => renderGameSuggestions(input, input.value))
  input.addEventListener('blur', () => setTimeout(() => {
    const box = input.parentElement.querySelector('.game-suggestions')
    if (box) box.style.display = 'none'
  }, 150))
}

// Render de tarjeta de reseña publicada con acciones
function mostrarReseña(r) {
  // Crear estrellas para mostrar la calificación
  const estrellasHtml = '★'.repeat(r.calificacion || 0) + '☆'.repeat(5 - (r.calificacion || 0));
  
  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <img src="${r.imagen}" alt="${r.titulo}">
    <div class="review-content">
      <div class="review-header">
        <div class="review-title-section">
          <h3>${r.titulo}</h3>
          <div class="review-rating" title="Calificación: ${r.calificacion || 0} de 5 estrellas">
            ${estrellasHtml}
            <span style="margin-left: 8px; font-size: 0.9rem; color: #aaa;">
              (${r.calificacion || 0}/5)
            </span>
            <span class="level-badge">${(r.level || 'intermedio').toUpperCase()}</span>
          </div>
        </div>
        <div class="review-actions" style="display:flex; gap:8px;">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn" style="background:#b23b3b; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;">Eliminar</button>
        </div>
      </div>
      <div class="review-text">${r.texto}</div>
      <div class="review-meta">
        <div class="review-author">
          <span class="review-user">${r.usuario}</span>
          <span class="review-date">Publicado el ${r.fecha}</span>
        </div>
        <div class="likes">
          <button class="like-btn">👍</button>
          <span class="like-count">${r.likes || 0}</span>
          <button class="dislike-btn">👎</button>
        </div>
      </div>
    </div>
  `;

  const likeBtn = card.querySelector('.like-btn');
  const dislikeBtn = card.querySelector('.dislike-btn');
  const likeCount = card.querySelector('.like-count');
  const editBtn = card.querySelector('.edit-btn');
  const deleteBtn = card.querySelector('.delete-btn');

  likeBtn.addEventListener('click', () => {
    r.likes++;
    likeCount.textContent = r.likes;
    actualizarLikes(r.id, r.likes);
  });

  dislikeBtn.addEventListener('click', () => {
    if (r.likes > 0) r.likes--;
    likeCount.textContent = r.likes;
    actualizarLikes(r.id, r.likes);
  });

  editBtn.addEventListener('click', () => {
    openEditModal(r)
  })

  deleteBtn.addEventListener('click', async () => {
    if (!confirm('¿Seguro que deseas eliminar esta reseña?')) return;
    const ok = await eliminarReseña(r.id);
    if (ok) {
      card.remove();
      alert('Reseña eliminada.');
    }
  });

lista.prepend(card);
}

function openEditModal(r) {
  const modal = document.getElementById('editReviewModal')
  const t = document.getElementById('editTituloJuego')
  const txt = document.getElementById('editTextoReseña')
  const stars = document.querySelectorAll('#edit-star-rating .edit-star')
  editingReviewId = r.id
  t.value = r.titulo || ''
  txt.value = r.texto || ''
  editCalificacion = r.calificacion || 0
  stars.forEach((s, i) => {
    s.classList.toggle('selected', i < editCalificacion)
    s.onclick = () => { editCalificacion = i + 1; stars.forEach((a, idx) => a.classList.toggle('selected', idx < editCalificacion)) }
    s.addEventListener('mouseenter', () => {
      stars.forEach((a, idx) => a.classList.toggle('hover', idx <= i))
    })
    s.addEventListener('mouseleave', () => {
      stars.forEach(a => a.classList.remove('hover'))
    })
  })
  modal.style.display = 'flex'
  document.getElementById('cancelEdit').onclick = closeEditModal
  document.getElementById('updateReview').onclick = async () => {
    const cambios = { titulo: t.value.trim(), texto: txt.value.trim(), calificacion: editCalificacion }
    const actualizado = await editarReseña(editingReviewId, cambios)
    if (actualizado) {
      closeEditModal()
      lista.innerHTML = ''
      await cargarReseñas()
      alert('Reseña actualizada correctamente.')
    }
  }
}

function closeEditModal() {
  const modal = document.getElementById('editReviewModal')
  modal.style.display = 'none'
  editingReviewId = null
}

// PUT likes (con fallback)
async function actualizarLikes(id, nuevosLikes) {
  try {
    await fetch(`${API_BASE}/api/resenas/${id}/likes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ likes: nuevosLikes })
    });
  } catch (e) {
    const reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];
    const index = reseñas.findIndex(r => r.id === id);
    if (index !== -1) {
      reseñas[index].likes = nuevosLikes;
      localStorage.setItem('reseñas', JSON.stringify(reseñas));
    }
  }
}

// PUT edición de reseña (con fallback)
async function editarReseña(id, cambios) {
  try {
    const resp = await fetch(`${API_BASE}/api/resenas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios)
    });
    if (!resp.ok) throw new Error('Error al editar reseña');
    return await resp.json();
  } catch (e) {
    // Fallback localStorage
    const reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];
    const idx = reseñas.findIndex(r => r.id === id);
    if (idx !== -1) {
      reseñas[idx] = { ...reseñas[idx], ...cambios };
      localStorage.setItem('reseñas', JSON.stringify(reseñas));
      return reseñas[idx];
    }
    return null;
  }
}

// DELETE reseña (con fallback)
async function eliminarReseña(id) {
  try {
    const resp = await fetch(`${API_BASE}/api/resenas/${id}`, {
      method: 'DELETE'
    });
    if (!resp.ok) throw new Error('Error al eliminar reseña');
    return true;
  } catch (e) {
    // Fallback localStorage
    const reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];
    const nuevas = reseñas.filter(r => r.id !== id);
    localStorage.setItem('reseñas', JSON.stringify(nuevas));
    return true;
  }
}

// === LOGIN Y REGISTRO ===
// Ahora la autenticación se gestiona en pages/shared/auth.js.
