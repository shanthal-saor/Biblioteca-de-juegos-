const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

if (loginBtn) loginBtn.onclick = () => loginModal.style.display = 'flex';
if (registerBtn) registerBtn.onclick = () => registerModal.style.display = 'flex';

window.addEventListener('click', e => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === registerModal) registerModal.style.display = 'none';
});

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
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
}

if (registerForm) {
  registerForm.addEventListener('submit', e => {
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
    }
  });
}


