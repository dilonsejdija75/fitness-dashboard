/**
 * Mobile Navigation Handler
 * Handles mobile menu functionality across all pages
 */

// Mobile menu functions
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const body = document.body;
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        body.classList.toggle('menu-open');
    }
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    const body = document.body;
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        body.classList.remove('menu-open');
    }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add mobile menu button if it doesn't exist
    if (!document.querySelector('.mobile-menu-btn')) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.onclick = toggleMobileMenu;
        mobileBtn.setAttribute('aria-label', 'Toggle navigation menu');
        mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(mobileBtn);
    }
    
    // Add mobile overlay if it doesn't exist
    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.onclick = closeMobileMenu;
        document.body.appendChild(overlay);
    }
    
    // Close menu when clicking nav links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
});
