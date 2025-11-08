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

  const usuario = localStorage.getItem('usuarioActivo');
  if (!usuario) {
    alert('Debes iniciar sesión o registrarte para publicar una reseña.');
    return;
  }

  if (calificacionSeleccionada === 0) {
    alert('Por favor selecciona una calificación de 1 a 5 estrellas.');
    return;
  }

  const titulo = document.getElementById('tituloJuego').value.trim();
  const imagen = document.getElementById('imagenJuego').value.trim() || 'img/placeholder.jpg';
  const texto = document.getElementById('textoReseña').value.trim();
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const reseña = { 
    usuario, 
    titulo, 
    imagen, 
    texto, 
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
    const resp = await fetch('http://localhost:3001/api/resenas', {
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
    const resp = await fetch('http://localhost:3001/api/resenas');
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
          </div>
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

  lista.prepend(card);
}

async function actualizarLikes(id, nuevosLikes) {
  try {
    await fetch(`http://localhost:3001/api/resenas/${id}/likes`, {
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

/* === LOGIN Y REGISTRO === */
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

document.getElementById('loginBtn').onclick = () => loginModal.style.display = 'flex';
document.getElementById('registerBtn').onclick = () => registerModal.style.display = 'flex';

window.onclick = e => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === registerModal) registerModal.style.display = 'none';
};

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  const users = JSON.parse(localStorage.getItem('usuarios')) || [];
  const validUser = users.find(u => u.user === user && u.pass === pass);
  if (validUser) {
    localStorage.setItem('usuarioActivo', user);
    alert(`Bienvenido, ${user}!`);
    loginModal.style.display = 'none';
  } else {
    alert('Usuario o contraseña incorrectos.');
  }
});

document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const user = document.getElementById('regUsername').value.trim();
  const pass = document.getElementById('regPassword').value.trim();
  const users = JSON.parse(localStorage.getItem('usuarios')) || [];
  if (users.find(u => u.user === user)) {
    alert('Ese usuario ya existe.');
  } else {
    users.push({ user, pass });
    localStorage.setItem('usuarios', JSON.stringify(users));
    alert('Cuenta creada correctamente.');
    registerModal.style.display = 'none';

    // Limpiar campos de registro
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
  }
});