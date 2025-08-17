async function handleAuth(action) {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const fullname = document.getElementById('fullname').value.trim();
    const institution = document.getElementById('institution').value.trim();
	
	console.log(email, password, fullname, institution);

    if (!email || !password) {
        showMessage('Please fill in email and password fields.', 'error');
        return;
    }

    if (action === 'register' && (!fullname || !institution)) {
        showMessage('Please fill in all fields for registration.', 'error');
        return;
    }

    const url = action === 'login' ? '/api/login' : '/api/register';
    const body = action === 'login'
        ? { email, password }
        : { email, password, fullname, institution };

    // Show loading state
    const buttons = document.querySelectorAll('.cta-button');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            if (action === 'register') {
                if (data.requiresVerification) {
                    showMessage(data.message, 'success');
                    showVerificationInstructions();
                } else {
                    showMessage(data.message, 'success');
                }
            } else {
                // Login successful
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = data.redirectTo || '/profile';
                }, 1500);
            }
        } else {
            if (data.requiresVerification) {
                showMessage(data.message, 'warning');
                showResendVerificationOption(email);
            } else {
                showMessage(data.message, 'error');
            }
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    } finally {
        // Re-enable buttons
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message-box');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    messageBox.innerHTML = `
        <div style="
            background: rgba(${type === 'success' ? '39, 174, 96' : type === 'error' ? '231, 76, 60' : type === 'warning' ? '243, 156, 18' : '52, 152, 219'}, 0.1);
            border: 1px solid ${colors[type]};
            color: ${colors[type]};
            padding: 15px 20px;
            border-radius: 10px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
        ">
            <span style="font-size: 1.2rem;">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;

    // Insert after the form
    const form = document.querySelector('.glass-card');
    form.appendChild(messageBox);

    // Auto-remove after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            if (messageBox.parentNode) {
                messageBox.remove();
            }
        }, 5000);
    }
}

function showVerificationInstructions() {
    const instructionsBox = document.createElement('div');
    instructionsBox.className = 'verification-instructions';
    instructionsBox.innerHTML = `
        <div style="
            background: rgba(52, 152, 219, 0.1);
            border: 1px solid #3498db;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            color: var(--text-primary);
        ">
            <h3 style="margin: 0 0 15px 0; color: #3498db;">📧 Check Your Email</h3>
            <p style="margin: 0 0 10px 0;">We've sent a verification link to your email address. Please:</p>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link</li>
                <li>Return here to log in</li>
            </ol>
            <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: var(--text-muted);">
                Didn't receive the email? Check your spam folder or try registering again.
            </p>
        </div>
    `;

    const form = document.querySelector('.glass-card');
    form.appendChild(instructionsBox);
}

function showResendVerificationOption(email) {
    const resendBox = document.createElement('div');
    resendBox.className = 'resend-verification';
    resendBox.innerHTML = `
        <div style="
            background: rgba(243, 156, 18, 0.1);
            border: 1px solid #f39c12;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        ">
            <p style="margin: 0 0 15px 0; color: var(--text-primary);">
                Your account is not yet verified. Please check your email for the verification link.
            </p>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">
                If you can't find the email, try checking your spam folder or register again to receive a new verification email.
            </p>
        </div>
    `;

    const form = document.querySelector('.glass-card');
    form.appendChild(resendBox);
}

async function logout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        const data = await response.json();
        showMessage(data.message, 'success');
        
        // Clear form
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('fullname').value = '';
        document.getElementById('institution').value = '';
        
        // Remove any existing messages after a delay
        setTimeout(() => {
            const messages = document.querySelectorAll('.message-box, .verification-instructions, .resend-verification');
            messages.forEach(msg => msg.remove());
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error logging out. Please try again.', 'error');
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .cta-button:disabled {
        cursor: not-allowed;
        transform: none !important;
    }
    
    .message-box, .verification-instructions, .resend-verification {
        animation: slideIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            // User is already logged in, redirect to profile
            const data = await response.json();
            showMessage(`Welcome back, ${data.fullname}! Redirecting to your profile...`, 'success');
            setTimeout(() => {
                window.location.href = '/profile';
            }, 2000);
        }
    } catch (error) {
        // User not logged in, stay on login page
        console.log('User not logged in');
    }
});