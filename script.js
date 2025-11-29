// n8n Webhook URLs - REPLACE WITH YOUR ACTUAL URLs
const N8N_WEBHOOKS = {
    AUTH: 'https://your-n8n-instance.com/webhook/auth',
    SUBMIT_FORM: 'https://your-n8n-instance.com/webhook/submit-form',
    GET_STATS: 'https://your-n8n-instance.com/webhook/get-stats'
};

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.add('hidden');
    
    if (tabName === 'login') {
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.getElementById('login-form').classList.remove('hidden');
    } else {
        document.querySelectorAll('.tab')[1].classList.add('active');
        document.getElementById('register-form').classList.remove('hidden');
    }
}

// Authentication functions
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    showMessage('Logging in...', 'info');
    
    try {
        const response = await fetch(N8N_WEBHOOKS.AUTH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'login',
                email: email,
                password: password 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result.user));
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    showMessage('Creating account...', 'info');
    
    try {
        const response = await fetch(N8N_WEBHOOKS.AUTH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'register',
                email: email,
                password: password 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Registration successful! Please login.', 'success');
            showTab('login');
        } else {
            showMessage(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Registration error:', error);
    }
}

// Dashboard functions
async function loadUserStats() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(N8N_WEBHOOKS.GET_STATS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.user_id })
        });
        
        const result = await response.json();
        if (result.success) {
            document.getElementById('total-submissions').textContent = result.stats.total;
            document.getElementById('approved-submissions').textContent = result.stats.approved;
            document.getElementById('rejected-submissions').textContent = result.stats.rejected;
            document.getElementById('pending-submissions').textContent = result.stats.pending;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function submitProject() {
    const user = JSON.parse(localStorage.getItem('user'));
    const form = document.getElementById('submission-form');
    
    const formData = {
        user_id: user.user_id,
        user_email: user.email,
        project_name: document.getElementById('project-name').value,
        description: document.getElementById('project-description').value,
        category: document.getElementById('project-category').value,
        project_url: document.getElementById('project-url').value,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    showMessage('Submitting project...', 'info');

    try {
        const response = await fetch(N8N_WEBHOOKS.SUBMIT_FORM, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            showMessage('Project submitted successfully!', 'success');
            form.reset();
            loadUserStats(); // Refresh stats
        } else {
            showMessage('Error submitting project: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        console.error('Submission error:', error);
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }, 5000);
    }
}
