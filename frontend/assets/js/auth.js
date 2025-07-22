// Save token in localStorage
function setToken(token) {
    localStorage.setItem('jwtToken', token);
}

// Check if user is logged in, otherwise redirect
function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '../auth/login.html';
    }
}

// Login form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) return alert('Enter email and password.');

    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // <-- Header
            body: JSON.stringify({ email, password })        // <-- Body
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error('Server error: ' + text);
        }
        if (response.ok && data.token) {
            setToken(data.token);
            console.log('Login success, redirecting...');
            window.location.href = '../profile/view.html';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert(err.message || 'Network error');
    }
});
const passwordToggle = document.getElementById('passwordToggle');
if (passwordToggle) {
    passwordToggle.addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        // Toggle Font Awesome icon
        if (isPassword) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
}

// Register form
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !email || !password) return alert('Please fill all fields.');

    try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error('Server error: ' + text);
        }
        if (response.ok && data.token) {
            setToken(data.token);
            console.log('Registration success, redirecting...');
            window.location.href = '../profile/view.html';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert(err.message || 'Network error');
    }
});

async function loadProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '../auth/login.html';
        return;
    }
    try {
        const response = await fetch('http://localhost:5001/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            alert('Session expired or unauthorized. Please login again.');
            localStorage.removeItem('jwtToken');
            window.location.href = '../auth/login.html';
            return;
        }

        if (!response.ok) {
            // Try to parse error details from backend
            let errorMsg = 'Failed to load profile.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
                if (errorData.details) errorMsg += ` (${errorData.details})`;
            } catch (e) {
                // If not JSON, ignore
            }
            alert(errorMsg);
            return;
        }

        const data = await response.json();
        // Check if input fields exist (edit.html)
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        if (usernameInput && emailInput) {
            usernameInput.value = data.username || '';
            emailInput.value = data.email || '';
        } else {
            // Otherwise, update profileData div (view.html)
            const profileDiv = document.getElementById('profileData');
            if (profileDiv) {
                profileDiv.innerHTML = `
                    <p><strong>Username:</strong> ${data.username}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                `;
            }
        }
    } catch (err) {
        alert('Network error. Please try again later.');
        console.error(err);
    }
}
