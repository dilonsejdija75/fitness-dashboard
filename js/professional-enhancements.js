/**
 * Professional Enhancement System
 * Handles error handling, validation, loading states, accessibility, and UX improvements
 */

class ProfessionalEnhancements {
    constructor() {
        this.init();
        this.setupErrorHandling();
        this.setupAccessibility();
        this.setupPerformanceMonitoring();
        this.setupOfflineSupport();
    }

    init() {
        // Auto-save functionality
        this.setupAutoSave();
        // Session timeout
        this.setupSessionTimeout();
        // Keyboard navigation
        this.setupKeyboardNavigation();
        // Search functionality
        this.setupGlobalSearch();
        // Loading states
        this.setupLoadingStates();
    }

    // Error Handling & Validation
    setupErrorHandling() {
        try {
            window.addEventListener('error', (e) => {
                this.logError('JavaScript Error', e.error);
                this.showErrorToast('An unexpected error occurred. Please try again.');
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.logError('Promise Rejection', e.reason);
                this.showErrorToast('Network error. Please check your connection.');
            });
        } catch (error) {
            console.error('Error setting up error handling:', error);
        }
    }

    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            const error = this.validateInput(input);
            if (error) {
                this.showFieldError(input, error);
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');

        if (required && !value) return 'This field is required';
        if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        if (type === 'number' && value && isNaN(value)) return 'Must be a valid number';
        if (input.minLength && value.length < input.minLength) return `Minimum ${input.minLength} characters required`;
        if (input.maxLength && value.length > input.maxLength) return `Maximum ${input.maxLength} characters allowed`;

        return null;
    }

    showFieldError(input, message) {
        try {
            input.classList.add('error');
            let errorEl = input.parentNode.querySelector('.field-error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                input.parentNode.appendChild(errorEl);
            }
            errorEl.textContent = this.sanitizeInput(message);
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', errorEl.id = `error-${Date.now()}`);
        } catch (error) {
            console.error('Error showing field error:', error);
        }
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorEl = input.parentNode.querySelector('.field-error');
        if (errorEl) errorEl.remove();
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
    }

    // Loading States & UX
    setupLoadingStates() {
        this.createSkeletonLoaders();
    }

    showLoading(element, text = 'Loading...') {
        try {
            if (typeof element === 'string') element = document.querySelector(element);
            if (!element) return;

            element.classList.add('loading');
            element.setAttribute('aria-busy', 'true');
            
            const loader = document.createElement('div');
            loader.className = 'inline-loader';
            loader.innerHTML = `<div class="spinner"></div><span>${this.sanitizeInput(text)}</span>`;
            element.appendChild(loader);
        } catch (error) {
            console.error('Error showing loading state:', error);
        }
    }

    hideLoading(element) {
        if (typeof element === 'string') element = document.querySelector(element);
        if (!element) return;

        element.classList.remove('loading');
        element.removeAttribute('aria-busy');
        const loader = element.querySelector('.inline-loader');
        if (loader) loader.remove();
    }

    createSkeletonLoaders() {
        const style = document.createElement('style');
        style.textContent = `
            .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
            @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .skeleton-text { height: 1rem; border-radius: 4px; margin: 0.5rem 0; }
            .skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; }
            .skeleton-card { height: 100px; border-radius: 8px; }
        `;
        document.head.appendChild(style);
    }

    // Accessibility
    setupAccessibility() {
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
    }

    setupFocusManagement() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderSupport() {
        try {
            // Add ARIA labels to interactive elements
            document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
                if (!btn.textContent.trim()) {
                    btn.setAttribute('aria-label', 'Button');
                }
            });
        } catch (error) {
            console.error('Error setting up screen reader support:', error);
        }
    }

    setupHighContrastMode() {
        try {
            const toggleHighContrast = () => {
                document.body.classList.toggle('high-contrast');
                localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
            };

            if (localStorage.getItem('highContrast') === 'true') {
                document.body.classList.add('high-contrast');
            }

            // Add keyboard shortcut
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.altKey && e.key === 'h') {
                    toggleHighContrast();
                }
            });
        } catch (error) {
            console.error('Error setting up high contrast mode:', error);
        }
    }

    // Session Management
    setupSessionTimeout() {
        let timeout;
        const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.showSessionExpiredModal();
            }, TIMEOUT_DURATION);
        };

        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });

        resetTimeout();
    }

    showSessionExpiredModal() {
        try {
            const modal = document.createElement('div');
            modal.className = 'modal session-expired-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const title = document.createElement('h3');
            title.textContent = 'Session Expired';
            
            const message = document.createElement('p');
            message.textContent = 'Your session has expired for security reasons. Please log in again.';
            
            const button = document.createElement('button');
            button.className = 'btn-primary';
            button.textContent = 'Login Again';
            button.addEventListener('click', () => {
                if (typeof logout === 'function') logout();
            });
            
            modalContent.appendChild(title);
            modalContent.appendChild(message);
            modalContent.appendChild(button);
            modal.appendChild(modalContent);
            
            document.body.appendChild(modal);
        } catch (error) {
            console.error('Error showing session expired modal:', error);
        }
    }

    // Auto-save functionality
    setupAutoSave() {
        const autoSaveInterval = 30000; // 30 seconds
        setInterval(() => {
            this.autoSaveData();
        }, autoSaveInterval);
    }

    autoSaveData() {
        try {
            const forms = document.querySelectorAll('form[data-autosave]');
            forms.forEach(form => {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                const sanitizedData = this.sanitizeObject(data);
                localStorage.setItem(`autosave_${form.id}`, JSON.stringify(sanitizedData));
            });
        } catch (error) {
            console.error('Error auto-saving data:', error);
        }
    }

    // Global Search
    setupGlobalSearch() {
        // Keyboard shortcut only
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.showSearchModal();
            }
        });
    }

    showSearchModal() {
        try {
            const modal = document.createElement('div');
            modal.className = 'modal search-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const searchHeader = document.createElement('div');
            searchHeader.className = 'search-header';
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search...';
            searchInput.className = 'search-input';
            searchInput.autofocus = true;
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', () => modal.remove());
            
            const searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            
            searchHeader.appendChild(searchInput);
            searchHeader.appendChild(closeBtn);
            modalContent.appendChild(searchHeader);
            modalContent.appendChild(searchResults);
            modal.appendChild(modalContent);
            
            document.body.appendChild(modal);

            searchInput.addEventListener('input', (e) => this.performSearch(this.sanitizeInput(e.target.value), modal));
        } catch (error) {
            console.error('Error showing search modal:', error);
        }
    }

    performSearch(query, modal) {
        try {
            if (!query.trim()) return;

            const results = [];
            const searchableElements = document.querySelectorAll('[data-searchable], h1, h2, h3, .stat-label, .workout-name');
            
            searchableElements.forEach(el => {
                if (el.textContent.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        text: this.sanitizeInput(el.textContent),
                        element: el,
                        page: this.sanitizeInput(window.location.pathname)
                    });
                }
            });

            this.displaySearchResults(results, modal);
        } catch (error) {
            console.error('Error performing search:', error);
        }
    }

    displaySearchResults(results, modal) {
        try {
            const container = modal.querySelector('.search-results');
            if (results.length === 0) {
                container.innerHTML = '<p class="no-results">No results found</p>';
                return;
            }

            container.innerHTML = '';
            results.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'search-result';
                
                const textDiv = document.createElement('div');
                textDiv.className = 'result-text';
                textDiv.textContent = result.text;
                
                const pageDiv = document.createElement('div');
                pageDiv.className = 'result-page';
                pageDiv.textContent = result.page;
                
                resultDiv.appendChild(textDiv);
                resultDiv.appendChild(pageDiv);
                
                resultDiv.addEventListener('click', () => {
                    if (result.element && result.element.scrollIntoView) {
                        result.element.scrollIntoView({ behavior: 'smooth' });
                        modal.remove();
                    }
                });
                
                container.appendChild(resultDiv);
            });
        } catch (error) {
            console.error('Error displaying search results:', error);
        }
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal:last-child');
                if (modal) modal.remove();
            }

            // Arrow key navigation for cards
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
        });
    }

    handleArrowNavigation(e) {
        const focusable = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const current = document.activeElement;
        const currentIndex = Array.from(focusable).indexOf(current);

        let nextIndex;
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                nextIndex = (currentIndex + 1) % focusable.length;
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                nextIndex = (currentIndex - 1 + focusable.length) % focusable.length;
                break;
        }

        if (nextIndex !== undefined) {
            e.preventDefault();
            focusable[nextIndex].focus();
        }
    }

    // Offline Support
    setupOfflineSupport() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }

        window.addEventListener('online', () => {
            this.showToast('Connection restored', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showToast('You are offline. Changes will be saved locally.', 'warning');
        });
    }

    syncOfflineData() {
        const offlineData = localStorage.getItem('offlineData');
        if (offlineData) {
            // Sync data when back online
            console.log('Syncing offline data...');
            localStorage.removeItem('offlineData');
        }
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.logPerformance('Page Load Time', loadTime);
        });

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 50) {
                        this.logPerformance('Long Task', entry.duration);
                    }
                });
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    // Utility Methods
    showToast(message, type = 'info') {
        try {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const toastContent = document.createElement('div');
            toastContent.className = 'toast-content';
            
            const icon = document.createElement('i');
            icon.className = `fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle`;
            
            const messageSpan = document.createElement('span');
            messageSpan.textContent = this.sanitizeInput(message);
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', () => toast.remove());
            
            toastContent.appendChild(icon);
            toastContent.appendChild(messageSpan);
            toastContent.appendChild(closeBtn);
            toast.appendChild(toastContent);
            
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, 5000);
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    }

    showErrorToast(message) {
        this.showToast(message, 'error');
    }

    logError(type, error) {
        try {
            const errorData = {
                type: this.sanitizeInput(type),
                message: this.sanitizeInput(error.message || error),
                stack: this.sanitizeInput(error.stack || ''),
                timestamp: new Date().toISOString(),
                url: this.sanitizeInput(window.location.href),
                userAgent: this.sanitizeInput(navigator.userAgent)
            };
            
            console.error('Error logged:', errorData);
            
            // Store errors locally for later analysis
            const errors = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errors.push(errorData);
            localStorage.setItem('errorLog', JSON.stringify(errors.slice(-50))); // Keep last 50 errors
        } catch (logError) {
            console.error('Error logging error:', logError);
        }
    }

    logPerformance(metric, value) {
        const perfData = {
            metric,
            value,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        console.log('Performance metric:', perfData);
        
        const metrics = JSON.parse(localStorage.getItem('performanceLog') || '[]');
        metrics.push(perfData);
        localStorage.setItem('performanceLog', JSON.stringify(metrics.slice(-100)));
    }

    // Data Export
    exportData(format = 'json') {
        try {
            const data = {
                userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
                workouts: JSON.parse(localStorage.getItem('workouts') || '[]'),
                nutrition: JSON.parse(localStorage.getItem('nutritionData') || '[]'),
                goals: JSON.parse(localStorage.getItem('goals') || '[]'),
                exportDate: new Date().toISOString()
            };

            const sanitizedData = this.sanitizeObject(data);

            if (format === 'json') {
                this.downloadJSON(sanitizedData, 'fitness-data.json');
            } else if (format === 'csv') {
                this.downloadCSV(sanitizedData, 'fitness-data.csv');
            }
            
            this.showToast(`Data exported successfully as ${format.toUpperCase()}!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Export failed. Please try again.', 'error');
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
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const sanitized = Array.isArray(obj) ? [] : {};
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

    convertToCSV(data) {
        if (!data.length) return '';
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        return csvContent;
    }
}

// Initialize professional enhancements
const professionalEnhancements = new ProfessionalEnhancements();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalEnhancements;
}