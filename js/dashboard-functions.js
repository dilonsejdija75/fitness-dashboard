function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function showHelpMenu() {
    try {
        const modal = document.createElement('div');
        modal.className = 'modal help-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const title = document.createElement('h3');
        title.innerHTML = '<i class="fas fa-question-circle"></i> Help & Support';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => modal.remove());
        
        modalHeader.appendChild(title);
        modalHeader.appendChild(closeBtn);
        
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        const helpOptions = document.createElement('div');
        helpOptions.className = 'help-options';
        
        const options = [
            { icon: 'fas fa-route', title: 'Take Interactive Tour', desc: 'Learn how to use this page\'s features', action: () => { startPageTour(); modal.remove(); } },
            { icon: 'fas fa-map', title: 'All Tours', desc: 'View tours for all pages', action: showAllTours },
            { icon: 'fas fa-keyboard', title: 'Keyboard Shortcuts', desc: 'View all available keyboard shortcuts', action: showKeyboardShortcuts },
            { icon: 'fas fa-download', title: 'Export Data', desc: 'Download your fitness data', action: showExportOptions },
            { icon: 'fas fa-universal-access', title: 'Accessibility', desc: 'Adjust accessibility settings', action: showAccessibilityOptions }
        ];
        
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'help-option';
            btn.innerHTML = `<i class="${option.icon}"></i><div><h4>${option.title}</h4><p>${option.desc}</p></div>`;
            btn.addEventListener('click', option.action);
            helpOptions.appendChild(btn);
        });
        
        modalBody.appendChild(helpOptions);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
    } catch (error) {
        console.error('Error showing help menu:', error);
    }
}

function showKeyboardShortcuts() {
    const modal = document.createElement('div');
    modal.className = 'modal shortcuts-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                        <span>Global Search</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>H</kbd>
                        <span>Toggle High Contrast</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Close Modal/Cancel</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Tab</kbd>
                        <span>Navigate Elements</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Arrow Keys</kbd>
                        <span>Navigate Cards</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Enter</kbd>
                        <span>Activate Button</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showExportOptions() {
    const modal = document.createElement('div');
    modal.className = 'modal export-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-download"></i> Export Your Data</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="export-options">
                    <button class="export-option" onclick="exportUserData('json'); this.closest('.modal').remove();">
                        <i class="fas fa-file-code"></i>
                        <div>
                            <h4>JSON Format</h4>
                            <p>Complete data backup in JSON format</p>
                        </div>
                    </button>
                    <button class="export-option" onclick="exportUserData('csv'); this.closest('.modal').remove();">
                        <i class="fas fa-file-csv"></i>
                        <div>
                            <h4>CSV Format</h4>
                            <p>Spreadsheet-compatible workout data</p>
                        </div>
                    </button>
                    <button class="export-option" onclick="exportUserData('pdf'); this.closest('.modal').remove();">
                        <i class="fas fa-file-pdf"></i>
                        <div>
                            <h4>PDF Report</h4>
                            <p>Formatted fitness report</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function exportUserData(format) {
    try {
        const validFormats = ['json', 'csv', 'pdf'];
        if (!validFormats.includes(format)) {
            throw new Error('Invalid export format');
        }
        
        const data = {
            userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
            workouts: JSON.parse(localStorage.getItem('workouts') || '[]'),
            nutrition: JSON.parse(localStorage.getItem('nutritionData') || '[]'),
            goals: JSON.parse(localStorage.getItem('goals') || '[]'),
            settings: JSON.parse(localStorage.getItem('userSettings') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const sanitizedData = sanitizeObject(data);
        const dateStr = new Date().toISOString().split('T')[0];
        
        if (format === 'json') {
            downloadJSON(sanitizedData, `fitness-data-${dateStr}.json`);
        } else if (format === 'csv') {
            downloadCSV(sanitizedData.workouts, `workouts-${dateStr}.csv`);
        } else if (format === 'pdf') {
            generatePDFReport(sanitizedData);
        }
        
        if (typeof professionalEnhancements !== 'undefined') {
            professionalEnhancements.showToast(`Data exported successfully as ${format.toUpperCase()}!`, 'success');
        }
    } catch (error) {
        console.error('Export error:', error);
        if (typeof professionalEnhancements !== 'undefined') {
            professionalEnhancements.showToast('Export failed. Please try again.', 'error');
        }
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}

function downloadCSV(data, filename) {
    try {
        if (!Array.isArray(data) || !data.length) {
            if (typeof professionalEnhancements !== 'undefined') {
                professionalEnhancements.showToast('No workout data to export', 'warning');
            }
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${sanitizeInput(String(row[header] || ''))}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadBlob(blob, sanitizeInput(filename));
    } catch (error) {
        console.error('CSV download error:', error);
        if (typeof professionalEnhancements !== 'undefined') {
            professionalEnhancements.showToast('CSV export failed', 'error');
        }
    }
}

function generatePDFReport(data) {
    try {
        const dateStr = new Date().toLocaleDateString();
        const reportHTML = `
            <html>
            <head><title>Fitness Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
                h2 { color: #1f2937; margin-top: 30px; }
                .profile { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .workout { border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .date { font-weight: bold; color: #3b82f6; }
            </style>
            </head>
            <body>
                <h1>Fitness Tracker Report</h1>
                <p>Generated on: ${sanitizeInput(dateStr)}</p>
                
                <h2>Profile Information</h2>
                <div class="profile">
                    <p><strong>Age:</strong> ${sanitizeInput(String(data.userProfile.age || 'Not set'))} years</p>
                    <p><strong>Height:</strong> ${sanitizeInput(String(data.userProfile.height || 'Not set'))} cm</p>
                    <p><strong>Weight:</strong> ${sanitizeInput(String(data.userProfile.weight || 'Not set'))} kg</p>
                    <p><strong>BMI:</strong> ${sanitizeInput(String(data.userProfile.bmi || 'Not calculated'))} (${sanitizeInput(String(data.userProfile.bmiCategory || 'Unknown'))})</p>
                </div>
                
                <h2>Workout Summary</h2>
                <p>Total Workouts: ${data.workouts.length}</p>
                ${data.workouts.map(workout => `
                    <div class="workout">
                        <div class="date">${sanitizeInput(String(workout.date || 'No date'))}</div>
                        <p><strong>Type:</strong> ${sanitizeInput(String(workout.type || 'Unknown'))}</p>
                        <p><strong>Duration:</strong> ${sanitizeInput(String(workout.duration || 0))} minutes</p>
                        <p><strong>Name:</strong> ${sanitizeInput(String(workout.name || 'Unnamed workout'))}</p>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
        
        const blob = new Blob([reportHTML], { type: 'text/html' });
        const filename = `fitness-report-${new Date().toISOString().split('T')[0]}.html`;
        downloadBlob(blob, sanitizeInput(filename));
    } catch (error) {
        console.error('PDF report generation error:', error);
        if (typeof professionalEnhancements !== 'undefined') {
            professionalEnhancements.showToast('Report generation failed', 'error');
        }
    }
}

function downloadBlob(blob, filename) {
    try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sanitizeInput(filename);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        if (typeof professionalEnhancements !== 'undefined') {
            professionalEnhancements.showToast('Download failed', 'error');
        }
    }
}

function showAccessibilityOptions() {
    const highContrast = document.body.classList.contains('high-contrast');
    const largeText = document.body.classList.contains('large-text');
    const modal = document.createElement('div');
    modal.className = 'modal accessibility-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-universal-access"></i> Accessibility Options</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="accessibility-options">
                    <label class="toggle-option">
                        <input type="checkbox" ${highContrast ? 'checked' : ''} onchange="toggleHighContrast()">
                        <span>High Contrast Mode</span>
                        <small>Improves visibility with higher color contrast</small>
                    </label>
                    <label class="toggle-option">
                        <input type="checkbox" ${largeText ? 'checked' : ''} onchange="toggleLargeText()">
                        <span>Large Text</span>
                        <small>Increases font size for better readability</small>
                    </label>
                    <label class="toggle-option">
                        <input type="checkbox" checked onchange="toggleKeyboardNavigation()">
                        <span>Keyboard Navigation</span>
                        <small>Navigate using Tab and arrow keys</small>
                    </label>
                    <label class="toggle-option">
                        <input type="checkbox" onchange="toggleReducedMotion()">
                        <span>Reduce Motion</span>
                        <small>Minimize animations and transitions</small>
                    </label>
                </div>
                <div class="accessibility-info">
                    <h4>Keyboard Shortcuts</h4>
                    <p><kbd>Ctrl+Alt+H</kbd> - Toggle High Contrast</p>
                    <p><kbd>Ctrl+K</kbd> - Open Search</p>
                    <p><kbd>Esc</kbd> - Close Modals</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    professionalEnhancements.showToast('High contrast mode ' + (document.body.classList.contains('high-contrast') ? 'enabled' : 'disabled'), 'success');
}

function toggleLargeText() {
    document.body.classList.toggle('large-text');
    localStorage.setItem('largeText', document.body.classList.contains('large-text'));
    professionalEnhancements.showToast('Large text mode ' + (document.body.classList.contains('large-text') ? 'enabled' : 'disabled'), 'success');
}

function toggleKeyboardNavigation() {
    document.body.classList.toggle('keyboard-navigation');
    professionalEnhancements.showToast('Keyboard navigation ' + (document.body.classList.contains('keyboard-navigation') ? 'enabled' : 'disabled'), 'success');
}

function toggleReducedMotion() {
    document.body.classList.toggle('reduced-motion');
    localStorage.setItem('reducedMotion', document.body.classList.contains('reduced-motion'));
    professionalEnhancements.showToast('Reduced motion ' + (document.body.classList.contains('reduced-motion') ? 'enabled' : 'disabled'), 'success');
}

function startPageTour() {
    const page = onboardingTour.getCurrentPage();
    onboardingTour.start(page);
}

function showAllTours() {
    const modal = document.createElement('div');
    modal.className = 'modal tours-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-map"></i> Available Tours</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tours-grid">
                    <button class="tour-option" onclick="window.location.href='index.html'; setTimeout(() => onboardingTour.start('dashboard'), 500);">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <h4>Dashboard Tour</h4>
                            <p>Learn about stats, goals, and progress tracking</p>
                        </div>
                    </button>
                    <button class="tour-option" onclick="window.location.href='exercise.html'; setTimeout(() => onboardingTour.start('exercise'), 500);">
                        <i class="fas fa-dumbbell"></i>
                        <div>
                            <h4>Exercise Tour</h4>
                            <p>Discover workout categories and tracking</p>
                        </div>
                    </button>
                    <button class="tour-option" onclick="window.location.href='nutrition.html'; setTimeout(() => onboardingTour.start('nutrition'), 500);">
                        <i class="fas fa-apple-alt"></i>
                        <div>
                            <h4>Nutrition Tour</h4>
                            <p>Learn about meal planning and tracking</p>
                        </div>
                    </button>
                    <button class="tour-option" onclick="window.location.href='analytics.html'; setTimeout(() => onboardingTour.start('analytics'), 500);">
                        <i class="fas fa-chart-bar"></i>
                        <div>
                            <h4>Analytics Tour</h4>
                            <p>Explore data visualization and insights</p>
                        </div>
                    </button>
                    <button class="tour-option" onclick="window.location.href='run-tracker.html'; setTimeout(() => onboardingTour.start('run-tracker'), 500);">
                        <i class="fas fa-running"></i>
                        <div>
                            <h4>Run Tracker Tour</h4>
                            <p>Learn about route tracking and running stats</p>
                        </div>
                    </button>
                    <button class="tour-option" onclick="window.location.href='calendar.html'; setTimeout(() => onboardingTour.start('calendar'), 500);">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <h4>Calendar Tour</h4>
                            <p>Discover workout scheduling and planning</p>
                        </div>
                    </button>
                </div>
                <div class="tour-actions">
                    <button class="btn-secondary" onclick="resetAllTours()">
                        Reset All Tours
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function resetAllTours() {
    const pages = ['dashboard', 'exercise', 'nutrition', 'analytics', 'run-tracker', 'calendar'];
    pages.forEach(page => {
        localStorage.removeItem(`tour_${page}_completed`);
    });
    professionalEnhancements.showToast('All tours have been reset. You can take them again!', 'success');
}

// Input sanitization function
function sanitizeInput(input) {
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
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'string') {
                sanitized[key] = sanitizeInput(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitized[key] = sanitizeObject(obj[key]);
            } else {
                sanitized[key] = obj[key];
            }
        }
    }
    return sanitized;
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
        if (localStorage.getItem('largeText') === 'true') {
            document.body.classList.add('large-text');
        }
        if (localStorage.getItem('reducedMotion') === 'true') {
            document.body.classList.add('reduced-motion');
        }
        
        document.querySelectorAll('form').forEach(form => {
            form.setAttribute('data-autosave', 'true');
        });
        
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', function() {
                if (typeof professionalEnhancements !== 'undefined') {
                    const error = professionalEnhancements.validateInput(this);
                    if (error) {
                        professionalEnhancements.showFieldError(this, error);
                    } else {
                        professionalEnhancements.clearFieldError(this);
                    }
                }
            });
        });
        
        document.querySelectorAll('button[onclick]').forEach(btn => {
            const originalOnclick = btn.onclick;
            btn.onclick = function(e) {
                if (typeof professionalEnhancements !== 'undefined') {
                    professionalEnhancements.showLoading(this, 'Processing...');
                    setTimeout(() => {
                        try {
                            originalOnclick.call(this, e);
                        } catch (error) {
                            console.error('Button click error:', error);
                        } finally {
                            professionalEnhancements.hideLoading(this);
                        }
                    }, 500);
                } else {
                    originalOnclick.call(this, e);
                }
            };
        });
    } catch (error) {
        console.error('DOM initialization error:', error);
    }
});