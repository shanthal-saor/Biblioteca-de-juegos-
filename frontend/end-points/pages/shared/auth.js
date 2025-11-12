// Auth compartido para páginas multipágina
(function(){
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginBtn && loginModal) loginBtn.onclick = () => loginModal.style.display = 'flex';
  if (registerBtn && registerModal) registerBtn.onclick = () => registerModal.style.display = 'flex';

  window.addEventListener('click', (e) => {
    if (loginModal && e.target === loginModal) loginModal.style.display = 'none';
    if (registerModal && e.target === registerModal) registerModal.style.display = 'none';
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value.trim();
      try {
        const resp = await fetch('http://localhost:3000/api/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass })
        });
        if (!resp.ok) throw new Error('Login fallido');
        const data = await resp.json();
        localStorage.setItem('usuarioActivo', data.user);
        alert(`Bienvenido, ${data.user}!`);
        if (loginModal) loginModal.style.display = 'none';
      } catch (err) {
        alert('Usuario o contraseña incorrectos.');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('regUsername').value.trim();
      const pass = document.getElementById('regPassword').value.trim();
      const emailInput = document.getElementById('regEmail');
      const email = emailInput ? emailInput.value.trim() : '';
      try {
        const resp = await fetch('http://localhost:3000/api/usuarios/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass, email })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(()=>({error:'Error'}));
          throw new Error(err.error || 'Registro fallido');
        }
        // Auto-login al terminar el registro
        localStorage.setItem('usuarioActivo', user);
        if (registerModal) registerModal.style.display = 'none';
        alert(`Cuenta creada correctamente. ¡Sesión iniciada como ${user}!`);
      } catch (err) {
        alert(err.message);
      }
    });
  }
})();