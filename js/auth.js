/**
 * Authentication System
 * Handles user login, signup, session management, and password validation
 */

class AuthSystem {
    constructor() {
        try {
            this.users = JSON.parse(localStorage.getItem('fitness_users') || '[]');
            this.currentUser = JSON.parse(localStorage.getItem('fitness_current_user') || 'null');
        } catch (error) {
            console.error('Error parsing stored data:', error);
            this.users = [];
            this.currentUser = null;
        }
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.currentUser && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
            return;
        }

        // Redirect to login if not authenticated
        if (!this.currentUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        try {
            // Login form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            }

            // Signup form
            const signupForm = document.getElementById('signupForm');
            if (signupForm) {
                signupForm.addEventListener('submit', (e) => this.handleSignup(e));
                
                // Password strength checker
                const passwordInput = document.getElementById('password');
                if (passwordInput) {
                    passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(this.sanitizeInput(e.target.value)));
                }
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }

        // Demo login
        const demoLogin = document.getElementById('demoLogin');
        if (demoLogin) {
            demoLogin.addEventListener('click', () => this.handleDemoLogin());
        }

        // Forgot password
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const email = this.sanitizeInput(formData.get('email'));
            const password = this.sanitizeInput(formData.get('password'));
            const remember = formData.get('remember');

            if (!this.validateEmail(email) || !password) {
                throw new Error('Please enter valid email and password');
            }

            this.showLoading(true);

            // Simulate API call
            await this.delay(1000);

            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.setCurrentUser(user, remember);
                this.showToast('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const userData = {
                firstName: this.sanitizeInput(formData.get('firstName')),
                lastName: this.sanitizeInput(formData.get('lastName')),
                email: this.sanitizeInput(formData.get('email')),
                password: this.sanitizeInput(formData.get('password')),
                confirmPassword: this.sanitizeInput(formData.get('confirmPassword')),
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                profile: {
                    avatar: null,
                    goals: [],
                    preferences: {}
                }
            };

            if (!this.validateSignupData(userData)) {
                return;
            }

            this.showLoading(true);

            // Simulate API call
            await this.delay(1500);

            delete userData.confirmPassword;
            this.users.push(userData);
            localStorage.setItem('fitness_users', JSON.stringify(this.users));
            
            this.showToast('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } catch (error) {
            console.error('Signup error:', error);
            this.showToast('Failed to create account', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    handleDemoLogin() {
        // Create demo user if doesn't exist
        const demoUser = {
            id: 'demo',
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@fitness.com',
            password: 'demo123',
            createdAt: new Date().toISOString(),
            profile: {
                avatar: null,
                goals: [
                    { type: 'weight_loss', target: 10, current: 3, unit: 'kg' },
                    { type: 'steps', target: 10000, current: 7500, unit: 'steps' }
                ],
                preferences: {
                    units: 'metric',
                    notifications: true
                }
            }
        };

        if (!this.users.find(u => u.id === 'demo')) {
            this.users.push(demoUser);
            localStorage.setItem('fitness_users', JSON.stringify(this.users));
        }

        this.setCurrentUser(demoUser, false);
        this.showToast('Demo login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    handleForgotPassword() {
        try {
            const email = prompt('Enter your email address:');
            if (email && this.validateEmail(this.sanitizeInput(email))) {
                this.showToast('Password reset link sent to your email', 'success');
            } else if (email) {
                this.showToast('Please enter a valid email address', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showToast('An error occurred. Please try again.', 'error');
        }
    }

    setCurrentUser(user, remember = false) {
        this.currentUser = user;
        localStorage.setItem('fitness_current_user', JSON.stringify(user));
        
        if (remember) {
            localStorage.setItem('fitness_remember_user', 'true');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('fitness_current_user');
        localStorage.removeItem('fitness_remember_user');
        window.location.href = 'login.html';
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let feedback = 'Very weak';

        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;

        // Character variety
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Update UI
        strengthBar.className = 'strength-bar';
        
        if (strength <= 2) {
            strengthBar.classList.add('weak');
            feedback = 'Weak';
        } else if (strength <= 4) {
            strengthBar.classList.add('fair');
            feedback = 'Fair';
        } else if (strength <= 5) {
            strengthBar.classList.add('good');
            feedback = 'Good';
        } else {
            strengthBar.classList.add('strong');
            feedback = 'Strong';
        }

        strengthText.textContent = feedback;
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }

    showToast(message, type = 'info') {
        try {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: '✓',
                error: '✗',
                warning: '⚠',
                info: 'ℹ'
            };

            const sanitizedMessage = this.sanitizeInput(message);
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${icons[type] || icons.info}</span>
                    <span class="toast-message">${sanitizedMessage}</span>
                </div>
            `;

            document.body.appendChild(toast);

            // Show toast
            setTimeout(() => toast.classList.add('show'), 100);

            // Hide and remove toast
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        } catch (error) {
            console.error('Toast error:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get current user data
    getCurrentUser() {
        return this.currentUser;
    }

    // Update user profile
    updateProfile(updates) {
        try {
            if (this.currentUser && updates) {
                const sanitizedUpdates = this.sanitizeObject(updates);
                this.currentUser = { ...this.currentUser, ...sanitizedUpdates };
                localStorage.setItem('fitness_current_user', JSON.stringify(this.currentUser));
                
                // Update in users array
                const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
                if (userIndex !== -1) {
                    this.users[userIndex] = this.currentUser;
                    localStorage.setItem('fitness_users', JSON.stringify(this.users));
                }
            }
        } catch (error) {
            console.error('Profile update error:', error);
        }
    }

    // Input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>"'&]/g, function(match) {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return escapeMap[match];
        });
    }

    // Sanitize object properties
    sanitizeObject(obj) {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string') {
                    sanitized[key] = this.sanitizeInput(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitized[key] = this.sanitizeObject(obj[key]);
                } else {
                    sanitized[key] = obj[key];
                }
            }
        }
        return sanitized;
    }

    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Signup data validation
    validateSignupData(userData) {
        if (!userData.firstName || userData.firstName.length < 2) {
            this.showToast('First name must be at least 2 characters', 'error');
            return false;
        }
        if (!userData.lastName || userData.lastName.length < 2) {
            this.showToast('Last name must be at least 2 characters', 'error');
            return false;
        }
        if (!this.validateEmail(userData.email)) {
            this.showToast('Please enter a valid email address', 'error');
            return false;
        }
        if (userData.password.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return false;
        }
        if (userData.password !== userData.confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return false;
        }
        if (this.users.find(u => u.email === userData.email)) {
            this.showToast('Email already exists', 'error');
            return false;
        }
        return true;
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}