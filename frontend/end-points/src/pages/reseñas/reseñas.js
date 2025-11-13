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

async function guardarReseña(r) {
  try {
    const resp = await fetch('/api/resenas', {
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

async function cargarReseñas() {
  try {
    const resp = await fetch('/api/resenas');
    if (!resp.ok) throw new Error('Error al obtener reseñas');
    const reseñas = await resp.json();
    reseñas.forEach(mostrarReseña);
  } catch (e) {
    const reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];
    reseñas.forEach(mostrarReseña);
  }
}

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

  editBtn.addEventListener('click', async () => {
    const nuevoTitulo = prompt('Editar título', r.titulo);
    if (nuevoTitulo === null) return; // cancelado
    const nuevoTexto = prompt('Editar texto de reseña', r.texto);
    if (nuevoTexto === null) return; // cancelado
    const nuevaCalificacion = prompt('Editar calificación (1-5)', String(r.calificacion || 0));
    const cal = Number(nuevaCalificacion);
    if (!isNaN(cal) && cal >= 1 && cal <= 5) {
      r.calificacion = cal;
    }

    // Actualizar en backend o localStorage
    const actualizado = await editarReseña(r.id, {
      titulo: nuevoTitulo,
      texto: nuevoTexto,
      calificacion: r.calificacion,
    });
    if (actualizado) {
      // Re-render de la tarjeta: reemplazar contenido
      card.remove();
      mostrarReseña(actualizado);
      alert('Reseña actualizada correctamente.');
    }
  });

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

async function actualizarLikes(id, nuevosLikes) {
  try {
    await fetch(`/api/resenas/${id}/likes`, {
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

async function editarReseña(id, cambios) {
  try {
    const resp = await fetch(`/api/resenas/${id}`, {
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

async function eliminarReseña(id) {
  try {
    const resp = await fetch(`/api/resenas/${id}`, {
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
