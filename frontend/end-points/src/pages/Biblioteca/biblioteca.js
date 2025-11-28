const API_BASE = 'http://localhost:3000' 
const addGameBtn = document.getElementById('addGameBtn') 
const gamesSection = document.getElementById('games') 
let allGames = [] 
let editingId = null 
let userLibrary = [] 

function normalizeGame(g) { 
  
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
  try { 
    const res = await fetch(`${API_BASE}/api/juegos`)
    if (!res.ok) throw new Error('No se pudo cargar juegos') 
    const data = await res.json() 
    return Array.isArray(data) ? data.map(normalizeGame) : [] 
  } catch (e) { return [] } 
}

function ensureSuggestionsContainer() {  
  
  const header = document.querySelector('.header') 
  if (!header) return null 
  let box = header.querySelector('.search-suggestions')
  if (!box) { box = document.createElement('div'); box.className = 'search-suggestions'; header.appendChild(box) }
  return box 
}

function renderSearchSuggestions(q) {
 
  const box = ensureSuggestionsContainer(); if (!box) return
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; return } 
  const matches = allGames.filter(g => g.titulo.toLowerCase().startsWith(q)).slice(0,6) 
  box.innerHTML = matches.map(m => `<div class="suggestion-item" data-id="${m.id}">${m.titulo}</div>`).join('') 
  box.style.display = matches.length ? 'block' : 'none' 
  box.querySelectorAll('.suggestion-item').forEach(el => { 

    
    el.addEventListener('click', () => { 
      const input = document.getElementById('search')
      if (input) input.value = el.textContent 
      renderBiblioteca() 
    })
  })
}

function loadLibrary() {
  
  try { userLibrary = JSON.parse(localStorage.getItem('biblioteca_personal')) || [] } catch { userLibrary = [] } 
}

function saveLibrary() { localStorage.setItem('biblioteca_personal', JSON.stringify(userLibrary)) } 



async function renderBiblioteca() { 
    
  if (!gamesSection) return 
  if (!allGames.length) allGames = await fetchJuegos() 
  if (!userLibrary.length) loadLibrary()
  const qEl = document.getElementById('search')
  const q = (qEl && qEl.value) ? qEl.value.trim().toLowerCase() : ''
  const filtered = q ? userLibrary.filter(g => g.titulo.toLowerCase().startsWith(q)) : userLibrary 
  gamesSection.innerHTML = ''
  filtered.forEach(g => gamesSection.appendChild(createCard(g))) 
  renderSearchSuggestions(q)
}

function createCard(game) {
  
  const card = document.createElement('div')
  card.className = 'game-card' 
  const own = !!game.own 
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
  const editBtn = card.querySelector('.edit-btn') 
  const deleteBtn = card.querySelector('.delete-btn') 
  const removeBtn = card.querySelector('.remove-btn') 
  if (editBtn) editBtn.addEventListener('click', () => openModal('edit', game))
  if (deleteBtn) deleteBtn.addEventListener('click', () => deleteGame(game.id)) 
  if (removeBtn) removeBtn.addEventListener('click', () => removeFromLibrary(game.id)) 
  return card   
}

function openModal(mode, game) {
  
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


document.addEventListener('DOMContentLoaded', () => { 
  
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


document.getElementById('addGameBtn')?.addEventListener('click', () => openModal('create', {}))
const chooser = document.getElementById('addChooser')
document.getElementById('addGameBtn')?.addEventListener('click', () => {
  chooser.style.display = chooser.style.display === 'block' ? 'none' : 'block'
})
document.getElementById('chooseCreate')?.addEventListener('click', () => { chooser.style.display = 'none'; openModal('create', {}) })
document.getElementById('chooseExisting')?.addEventListener('click', () => { chooser.style.display = 'none'; openExistingModal() })

document.getElementById('gameForm')?.addEventListener('submit', async (e) => {
 
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

function collectGameForm() {
  
  const titulo = document.getElementById('gameTitle').value.trim()
  const cover = document.getElementById('gameCover').value.trim()
  const genero = document.getElementById('gameGenero').value.trim()
  const fecha = document.getElementById('gameFecha').value.trim()
  const descripcion = document.getElementById('gameDescripcion').value.trim()
  const generos = genero ? [genero] : []
  return { titulo, cover, generos, fecha, descripcion }
}

async function deleteGame(id) {
 
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
  
  userLibrary = userLibrary.filter(g => g.id !== id)
  saveLibrary()
  renderBiblioteca()
}

function openExistingModal() {
 
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
  
  const modal = document.getElementById('addGameModal')
  document.getElementById('existingPicker').classList.add('hidden')
  document.getElementById('gameForm').classList.remove('hidden')
  modal.style.display = 'none'
}

let selectedExistingIds = new Set()
async function renderExistingGrid() {
 
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
