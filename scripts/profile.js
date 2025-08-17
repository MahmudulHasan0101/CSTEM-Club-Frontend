let currentUserData = null;
let isEditMode = false;

// Load profile when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
});

async function loadProfile() {
    const loginRequiredOverlay = document.getElementById('loginRequiredOverlay');
    
    try {
        const response = await fetch('${window.backendURL}/api/profile');
        const data = await response.json();

        if (response.ok) {
            currentUserData = data;
            displayProfile(data);
        } else {
            loginRequiredOverlay.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        loginRequiredOverlay.style.display = 'flex';
    }
}

function displayProfile(userData) {
    // Update profile header
    document.getElementById('profileName').textContent = userData.fullname;
    document.getElementById('profileInstitution').textContent = userData.institution;
    
    // Update avatar initials
    const initials = userData.fullname.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
    
    // Update join date
    const joinDate = userData.joinedDate ? formatDate(userData.joinedDate) : 'Not available';
    document.getElementById('joinDate').textContent = joinDate;
    
    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    if (userData.verified) {
        statusBadge.className = 'status-badge verified';
        statusBadge.innerHTML = '<span>✓ Verified</span>';
    } else {
        statusBadge.className = 'status-badge unverified';
        statusBadge.innerHTML = '<span>⚠ Unverified</span>';
    }
    
    // Update profile details
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('viewFullName').textContent = userData.fullname;
    document.getElementById('viewInstitution').textContent = userData.institution;
    
    // Pre-fill edit form
    document.getElementById('editFullName').value = userData.fullname;
    document.getElementById('editInstitution').value = userData.institution;
    
    // Update membership status
    document.getElementById('membershipStatus').textContent = userData.verified ? 'Verified Member' : 'Pending Verification';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function toggleEditMode() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const editBtn = document.getElementById('editBtn');
    
    if (isEditMode) {
        // Switch to view mode
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        editBtn.innerHTML = '<span>✏️ Edit Profile</span>';
        isEditMode = false;
    } else {
        // Switch to edit mode
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        editBtn.innerHTML = '<span>👁️ View Mode</span>';
        isEditMode = true;
    }
}

function cancelEdit() {
    // Reset form values to original data
    if (currentUserData) {
        document.getElementById('editFullName').value = currentUserData.fullname;
        document.getElementById('editInstitution').value = currentUserData.institution;
    }
    toggleEditMode();
}

async function saveProfile() {
    const fullname = document.getElementById('editFullName').value.trim();
    const institution = document.getElementById('editInstitution').value.trim();
    
    if (!fullname || !institution) {
        alert('Please fill in all fields.');
        return;
    }
    
    try {
        const response = await fetch('${window.backendURL}/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullname, institution })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Profile updated successfully!');
            // Update current user data
            currentUserData.fullname = fullname;
            currentUserData.institution = institution;
            // Refresh display
            displayProfile(currentUserData);
            // Switch back to view mode
            toggleEditMode();
        } else {
            alert(data.message || 'Error updating profile.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Something went wrong. Please try again.');
    }
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('${window.backendURL}/api/logout', {
                method: 'POST'
            });
            
            const data = await response.json();
            alert(data.message);
            
            // Redirect to home page
            window.location.href = '/';
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Error logging out. Please try again.');
        }
    }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Add typing effect to profile name (just for fun)
    setTimeout(() => {
        const nameElement = document.getElementById('profileName');
        if (nameElement && currentUserData) {
            typeWriter(nameElement, currentUserData.fullname, 100);
        }
    }, 1000);
});

function typeWriter(element, text, speed) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Add smooth scrolling for better UX
document.documentElement.style.scrollBehavior = 'smooth';