const API_BASE = 'http://localhost:3000' // se conecta al backend por medio del servidor 3000//
const addGameBtn = document.getElementById('addGameBtn') //-boton para agregar juegos a la biblioteca (es el que le sa funcionalidad)//
const gamesSection = document.getElementById('games') //-crea una tarjeta para el juego y la agrega a lapagina//
let allGames = [] //almacena todos los juegos disponibles//
let editingId = null //almacena el ID del juego que se está editando este controla el modo crear/editar//
let userLibrary = [] //almacena los juegos que el usuario creo a su bliblioteca//

function normalizeGame(g) { // el G es el juego que se está normalizando, asume que siempre venga como objeto
  // Normaliza objetos de juego provenientes del backend/catálogo (es el que los resive)
  return {
    id: g.id,
    titulo: g.titulo || g.name || 'Sin título', // busca el titulo en el juego, si no hay, busca el name, si no hay, pone Sin título
    cover: g.cover || g.image || '', // busca la cover en el juego, si no hay, busca la image, si no hay, pone una imagen por defecto
    genero: g.genero || g.genre || '', // busca el genero en el juego, si no hay, busca el genre, si no hay, pone N/D
    fecha: g.fecha || g.Fechadecreaccion || '', // busca la fecha en el juego, si no hay, busca la Fechadecreaccion, si no hay, pone N/D
    compania: g.compania || g.company || '', // busca la compania en el juego,puede ser en ingles o en español.
    descripcion: g.descripcion || g.description || '', // busca la descripcion en el juego,si no hay, pone N/D
    plataformas: Array.isArray(g.plataformas) ? g.plataformas : [], // si hay plataformas, las convierte en array, si no hay, pone un array vacio
  }
}

async function fetchJuegos() { // obtiene los juegos del backend y los normaliza, le hace peticiones al API de obtener juegos
  // GET catálogo de juegos
  try { // intenta hacer la petición al backend, si no funciona, devuelve un array vacio
    const res = await fetch(`${API_BASE}/api/juegos`) // hace la petición al backend para obtener los juegos
    if (!res.ok) throw new Error('No se pudo cargar juegos') // si la petición no es exitosa, lanza un error
    const data = await res.json() // convierte la respuesta de la base de datos en JSON
    return Array.isArray(data) ? data.map(normalizeGame) : [] // si es un array, normaliza cada juego y devuelve el array, si no, devuelve un array vacio
  } catch (e) { return [] } // si hay un error, devuelve un array vacio 
}

function ensureSuggestionsContainer() { //sugerencias que aparece cuando escribes en la barra de busqueda 
  
  const header = document.querySelector('.header') // busca el encabezado en la pagina
  if (!header) return null // si no hay encabezado, devuelve null
  let box = header.querySelector('.search-suggestions')// busca el contenedor de sugerencias en el encabezado
  if (!box) { box = document.createElement('div'); box.className = 'search-suggestions'; header.appendChild(box) } // si no hay contenedor, crea uno y lo agrega al encabezado
  return box // plasma el juego encontrado
}

function renderSearchSuggestions(q) {
  // Renderiza coincidencias en el dropdown de búsqueda
  const box = ensureSuggestionsContainer(); if (!box) return
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; return } // si no hay consulta, limpia el contenedor y lo oculta
  const matches = allGames.filter(g => g.titulo.toLowerCase().startsWith(q)).slice(0,6) // filtra los juegos que coinciden con la consulta y limita a 6
  box.innerHTML = matches.map(m => `<div class="suggestion-item" data-id="${m.id}">${m.titulo}</div>`).join('') // renderiza cada juego en el contenedor
  box.style.display = matches.length ? 'block' : 'none' // si hay coincidencias, muestra el contenedor, si no, lo oculta  
  box.querySelectorAll('.suggestion-item').forEach(el => { // para cada juego en el contenedor

    // agrega un evento de click a cada juego en el contenedor
    el.addEventListener('click', () => { // cuando se hace click en el juego
      const input = document.getElementById('search')
      if (input) input.value = el.textContent // pone el titulo del juego en el input de busqueda
      renderBiblioteca() // renderiza la biblioteca con el juego seleccionado
    })
  })
}

function loadLibrary() {
  // Carga biblioteca personal desde LocalStorage (MEMORIA)
  try { userLibrary = JSON.parse(localStorage.getItem('biblioteca_personal')) || [] } catch { userLibrary = [] } // intenta parsear la biblioteca personal desde LocalStorage, si no funciona, devuelve un array vacio
}

function saveLibrary() { localStorage.setItem('biblioteca_personal', JSON.stringify(userLibrary)) } // guarda la biblioteca personal en LocalStorage



async function renderBiblioteca() { // renderiza la biblioteca con el juego seleccionado, MUESTRA LOS JUEGOS EN PANTALLA
    
  if (!gamesSection) return // verifica si hay juegos en la seccion
  if (!allGames.length) allGames = await fetchJuegos() // si no hay juegos en la seccion, obtiene los juegos del backend y los normaliza
  if (!userLibrary.length) loadLibrary()
  const qEl = document.getElementById('search')
  const q = (qEl && qEl.value) ? qEl.value.trim().toLowerCase() : ''
  const filtered = q ? userLibrary.filter(g => g.titulo.toLowerCase().startsWith(q)) : userLibrary // filtra los juegos que coinciden con la consulta y limita a 6
  gamesSection.innerHTML = ''
  filtered.forEach(g => gamesSection.appendChild(createCard(g))) // para cada juego en la biblioteca, crea una tarjeta y la agrega al contenedor
  renderSearchSuggestions(q)
}

function createCard(game) {
  // Construye una tarjeta de juego con acciones según sea propio o agregado
  const card = document.createElement('div')
  card.className = 'game-card' // crea una tarjeta de juego
  const own = !!game.own // verifica si el juego es propio o agregado
  card.innerHTML = `
    <img src="${game.cover}" alt="${game.titulo}" onerror="this.src='https://via.placeholder.com/280x160?text=No+Image'" />
    <div class="game-info"> // agrega la informacion del juego a la tarjeta
      <h3>${game.titulo}</h3>
      <div class="actions" style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
        ${own ? '<button class="edit-btn">Editar</button>' : ''}
        ${own ? '<button class="delete-btn" style="background:#b23b3b; color:#fff; border:none; border-radius:8px; padding:6px 10px; cursor:pointer;">Eliminar</button>' : '<button class="remove-btn" style="background:#3c3d48; color:#fff; border:none; border-radius:8px; padding:6px 10px; cursor:pointer;">Quitar</button>'}
      </div>
    </div>
  `
  const editBtn = card.querySelector('.edit-btn') // busca el boton de editar en la tarjeta
  const deleteBtn = card.querySelector('.delete-btn') // busca el boton de eliminar en la tarjeta
  const removeBtn = card.querySelector('.remove-btn') // busca el boton de quitar en la tarjeta
  if (editBtn) editBtn.addEventListener('click', () => openModal('edit', game)) // agrega un evento de click al boton de editar
  if (deleteBtn) deleteBtn.addEventListener('click', () => deleteGame(game.id)) // agrega un evento de click al boton de eliminar
  if (removeBtn) removeBtn.addEventListener('click', () => removeFromLibrary(game.id)) // agrega un evento de click al boton de quitar
  return card // devuelve la tarjeta con los eventos agregados  
}

function openModal(mode, game) {
  // Abre modal de crear/editar juego, precargando datos si aplica
  const modal = document.getElementById('addGameModal') 
  const title = document.getElementById('modalTitle')
  const submitBtn = document.getElementById('submitGame')
  editingId = mode === 'edit' ? game.id : null
  title.textContent = mode === 'edit' ? 'Editar Juego' : 'Agregar Nuevo Juego'
  submitBtn.textContent = mode === 'edit' ? 'Guardar' : 'Crear'
  document.getElementById('gameTitle').value = game?.titulo || ''
  document.getElementById('gameGenero').value = game?.genero || ''
  document.getElementById('gameFecha').value = game?.fecha || ''
  document.getElementById('gameDescripcion').value = game?.descripcion || ''
  document.getElementById('gameCover').value = game?.cover || ''
  const preview = document.getElementById('cover-preview')
  if (game?.cover) { preview.src = game.cover; preview.classList.remove('hidden') } else { preview.classList.add('hidden'); preview.src = '' }
  modal.style.display = 'flex'
}

function closeModal() { const modal = document.getElementById('addGameModal'); modal.style.display = 'none' } 
// Cierra el modal de crear/editar juego

document.addEventListener('DOMContentLoaded', () => { // cuando el DOM está cargado, renderiza la biblioteca con el juego seleccionado
  // Inicialización: render y manejadores de subida de imagen
  renderBiblioteca()
  const input = document.getElementById('search') 
  if (input) input.addEventListener('input', () => renderBiblioteca())
  const closeBtn = document.getElementById('closeAddGameModal')
  const cancelBtn = document.getElementById('cancelGame')
  if (closeBtn) closeBtn.addEventListener('click', closeModal)
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal)
  const uploadEl = document.getElementById('upload-cover')
  if (uploadEl) uploadEl.addEventListener('change', () => {
    const file = uploadEl.files[0]
    const preview = document.getElementById('cover-preview')
    const hidden = document.getElementById('gameCover')
    if (file) {
      const reader = new FileReader()
      reader.onload = e => { const dataUrl = e.target.result; preview.src = dataUrl; preview.classList.remove('hidden'); hidden.value = dataUrl }
      reader.readAsDataURL(file)
    }
  })
})
// Maneja el evento de click en el boton de agregar juego, mostrando el modal de crear/editar juego

document.getElementById('addGameBtn')?.addEventListener('click', () => openModal('create', {}))
const chooser = document.getElementById('addChooser')
document.getElementById('addGameBtn')?.addEventListener('click', () => {
  chooser.style.display = chooser.style.display === 'block' ? 'none' : 'block'
})
document.getElementById('chooseCreate')?.addEventListener('click', () => { chooser.style.display = 'none'; openModal('create', {}) })
document.getElementById('chooseExisting')?.addEventListener('click', () => { chooser.style.display = 'none'; openExistingModal() })

document.getElementById('gameForm')?.addEventListener('submit', async (e) => {
  // Crear o actualizar juego; añade el creado a la biblioteca vía GET por id
  e.preventDefault()
  const body = collectGameForm()
  const isEdit = !!editingId
  try {
    const url = isEdit ? `${API_BASE}/api/juegos/${editingId}` : `${API_BASE}/api/juegos`
    const method = isEdit ? 'PUT' : 'POST'
    const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!resp.ok) throw new Error('Error al guardar juego')
    const saved = await resp.json()
    if (isEdit) {
      const idxAll = allGames.findIndex(g => g.id === editingId)
      if (idxAll !== -1) allGames[idxAll] = normalizeGame({ ...allGames[idxAll], ...saved })
      const idxLib = userLibrary.findIndex(g => g.id === editingId)
      if (idxLib !== -1) userLibrary[idxLib] = { ...normalizeGame(saved), own: true }
      saveLibrary()
    } else {
      try {
        const checkResp = await fetch(`${API_BASE}/api/juegos/${saved.id}`)
        const got = checkResp.ok ? await checkResp.json() : saved
        const normalized = normalizeGame(got)
        allGames.push(normalized)
        userLibrary.push({ ...normalized, own: true })
        saveLibrary()
      } catch {
        const normalized = normalizeGame(saved)
        allGames.push(normalized)
        userLibrary.push({ ...normalized, own: true })
        saveLibrary()
      }
    }
    closeModal()
    renderBiblioteca()
  } catch (err) { alert('No se pudo guardar el juego') }
})

// Extrae y estructura datos del formulario de juego
function collectGameForm() {
  // Extrae y estructura datos del formulario de juego
  const titulo = document.getElementById('gameTitle').value.trim()
  const cover = document.getElementById('gameCover').value.trim()
  const genero = document.getElementById('gameGenero').value.trim()
  const fecha = document.getElementById('gameFecha').value.trim()
  const descripcion = document.getElementById('gameDescripcion').value.trim()
  const generos = genero ? [genero] : []
  return { titulo, cover, generos, fecha, descripcion }
}

async function deleteGame(id) {
  // DELETE juego; sincroniza catálogo y biblioteca personal
  if (!confirm('¿Eliminar este juego?')) return
  try {
    const resp = await fetch(`${API_BASE}/api/juegos/${id}`, { method: 'DELETE' })
    if (!resp.ok) throw new Error('Error al eliminar')
    allGames = allGames.filter(g => g.id !== id)
    userLibrary = userLibrary.filter(g => g.id !== id)
    saveLibrary()
    renderBiblioteca()
  } catch (e) { alert('No se pudo eliminar el juego') }
}

function removeFromLibrary(id) {
  // Quita un juego agregado de la biblioteca personal
  userLibrary = userLibrary.filter(g => g.id !== id)
  saveLibrary()
  renderBiblioteca()
}

function openExistingModal() {
  // Abre el picker de juegos existentes con búsqueda y multiselección
  const modal = document.getElementById('addGameModal')
  const title = document.getElementById('modalTitle')
  title.textContent = 'Agregar juego existente'
  document.getElementById('gameForm').classList.add('hidden')
  const picker = document.getElementById('existingPicker')
  picker.classList.remove('hidden')
  modal.style.display = 'flex'
  selectedExistingIds.clear()
  renderExistingGrid()
  const search = document.getElementById('existingSearch')
  if (search) search.addEventListener('input', renderExistingGrid)
  document.getElementById('cancelExisting').onclick = closeExistingModal
  document.getElementById('addExistingBtn').onclick = addSelectedExisting
}

function closeExistingModal() {
  // Cierra el picker y restaura el formulario
  const modal = document.getElementById('addGameModal')
  document.getElementById('existingPicker').classList.add('hidden')
  document.getElementById('gameForm').classList.remove('hidden')
  modal.style.display = 'none'
}

let selectedExistingIds = new Set()
async function renderExistingGrid() {
  // Renderiza la grilla scrollable de juegos existentes con selección
  if (!allGames.length) allGames = await fetchJuegos()
  const grid = document.getElementById('existingGrid')
  const q = document.getElementById('existingSearch').value.trim().toLowerCase()
  const list = q ? allGames.filter(g => g.titulo.toLowerCase().startsWith(q)) : allGames
  grid.innerHTML = ''
  list.forEach(g => {
    const item = document.createElement('div')
    const isSelected = selectedExistingIds.has(g.id)
    item.className = 'game-card' + (isSelected ? ' selected' : '')
    item.innerHTML = `
      <input type="checkbox" class="select-check" ${isSelected ? 'checked' : ''} />
      <img src="${g.cover}" alt="${g.titulo}">
      <div class="game-info"><h3>${g.titulo}</h3></div>
    `
    item.addEventListener('click', () => { 
      if (selectedExistingIds.has(g.id)) selectedExistingIds.delete(g.id); else selectedExistingIds.add(g.id); 
      renderExistingGrid() 
    })
    const check = item.querySelector('.select-check')
    check.addEventListener('click', (e) => { e.stopPropagation(); if (check.checked) selectedExistingIds.add(g.id); else selectedExistingIds.delete(g.id); item.classList.toggle('selected', check.checked) })
    grid.appendChild(item)
  })
}

function addSelectedExisting() {
  // Agrega los juegos seleccionados del picker a la biblioteca personal
  if (!selectedExistingIds.size) return
  const toAdd = allGames.filter(x => selectedExistingIds.has(x.id))
  toAdd.forEach(g => {
    if (!userLibrary.some(x => x.id === g.id)) {
      userLibrary.push({ ...g, own: false })
    }
  })
  saveLibrary()
  selectedExistingIds.clear()
  closeExistingModal()
  renderBiblioteca()
}

function buscar() { renderBiblioteca() }
// === Biblioteca (JS)
// Función: administrar la biblioteca personal del usuario y CRUD contra /api/juegos
// Componentes: búsqueda, render de tarjetas, modal crear/editar, picker de existentes