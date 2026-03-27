// Modal functions
function goToPage(page) {
  if (page === 'signup') {
    openSignUp();
  } else if (page === 'signin') {
    openSignIn();
  }
}

function openSignUp() {
  document.getElementById('signupModal').classList.add('active');
}

function openSignIn() {
  document.getElementById('signinModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
  const signupModal = document.getElementById('signupModal');
  const signinModal = document.getElementById('signinModal');
  
  if (event.target === signupModal) {
    signupModal.classList.remove('active');
  }
  if (event.target === signinModal) {
    signinModal.classList.remove('active');
  }
}

// Sign Up Handler
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const hospitalName = document.getElementById('signupHospitalName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  const role = document.getElementById('signupRole').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hospitalName,
        email,
        password,
        confirmPassword,
        role
      })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/html/dashboard.html';
    } else {
      alert(data.error || 'Sign up failed');
    }
  } catch (err) {
    console.error(err);
    alert('An error occurred');
  }
});

// Sign In Handler
document.getElementById('signinForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/html/dashboard.html';
    } else {
      alert(data.error || 'Sign in failed');
    }
  } catch (err) {
    console.error(err);
    alert('An error occurred');
  }
});
