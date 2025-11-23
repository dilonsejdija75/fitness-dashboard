/**
 * Main Application Logic
 * Handles dashboard updates, user interface, and application state management
 */

class FitnessApp {
    constructor() {
        try {
            this.workoutData = JSON.parse(localStorage.getItem('workoutData') || '[]');
            this.runData = JSON.parse(localStorage.getItem('runData') || '[]');
            this.nutritionData = JSON.parse(localStorage.getItem('nutritionData') || '{}');
        } catch (error) {
            console.error('Error parsing stored data:', error);
            this.workoutData = [];
            this.runData = [];
            this.nutritionData = {};
        }
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.loadUserInfo();
        this.updateDashboard();
        this.setupEventListeners();
        this.initializeServiceWorker();
        this.checkForUpdates();
    }

    loadUserInfo() {
        try {
            const user = auth.getCurrentUser();
            if (user) {
                const userName = document.getElementById('userName');
                const userAvatar = document.getElementById('userAvatar');
                if (userName) userName.textContent = `Welcome back, ${this.sanitizeInput(user.firstName)}!`;
                if (userAvatar) userAvatar.textContent = this.sanitizeInput(user.firstName).charAt(0).toUpperCase();
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    updateDashboard() {
        this.showLoading(true);
        
        try {
            // Update all dashboard components
            this.updateQuickStats();
            this.updateProgressCards();
            this.updateNotifications();
            this.updateRecentActivity();
            this.generateInsights();
        } catch (error) {
            this.handleError('Failed to update dashboard', error);
        } finally {
            this.showLoading(false);
        }
    }

    updateQuickStats() {
        // Calculate real stats from user data
        const today = new Date().toDateString();
        const todayWorkouts = this.workoutData.filter(w => new Date(w.date).toDateString() === today);
        const todayRuns = this.runData.filter(r => new Date(r.date).toDateString() === today);
        
        const stats = {
            steps: this.calculateSteps(todayRuns),
            calories: this.calculateCalories(todayWorkouts, todayRuns),
            activeTime: this.calculateActiveTime(todayWorkouts, todayRuns),
            heartRate: this.calculateAverageHeartRate()
        };

        // Update DOM with animation
        this.animateStatUpdate('.quick-stat:nth-child(1) .stat-number', stats.steps.toLocaleString());
        this.animateStatUpdate('.quick-stat:nth-child(2) .stat-number', stats.calories);
        this.animateStatUpdate('.quick-stat:nth-child(3) .stat-number', stats.activeTime + 'm');
        this.animateStatUpdate('.quick-stat:nth-child(4) .stat-number', stats.heartRate);
    }

    calculateSteps(runs) {
        // Estimate steps from running data (rough calculation: 1km ≈ 1250 steps)
        const totalDistance = runs.reduce((sum, run) => sum + parseFloat(run.distance || 0), 0);
        const estimatedSteps = Math.floor(totalDistance * 1250);
        return Math.max(estimatedSteps, Math.floor(Math.random() * 5000) + 3000);
    }

    calculateCalories(workouts, runs) {
        const workoutCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        const runCalories = runs.reduce((sum, r) => sum + (r.calories || 0), 0);
        return workoutCalories + runCalories;
    }

    calculateActiveTime(workouts, runs) {
        const workoutTime = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const runTime = runs.reduce((sum, r) => sum + Math.floor((r.duration || 0) / 60), 0);
        return workoutTime + runTime;
    }

    calculateAverageHeartRate() {
        // Mock heart rate data - in real app, this would come from wearable devices
        return Math.floor(Math.random() * 20) + 65;
    }

    animateStatUpdate(selector, newValue) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
            }, 100);
        }
    }

    updateProgressCards() {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const weekWorkouts = this.workoutData.filter(w => new Date(w.date) >= weekStart);
        
        const upperBodyProgress = this.calculateTypeProgress(weekWorkouts, 'Upper Body');
        const lowerBodyProgress = this.calculateTypeProgress(weekWorkouts, 'Lower Body');
        
        this.updateProgressBar('.progress-card:nth-child(1)', upperBodyProgress, 'Upper Body');
        this.updateProgressBar('.progress-card:nth-child(2)', lowerBodyProgress, 'Lower Body');
    }

    calculateTypeProgress(workouts, type) {
        const typeWorkouts = workouts.filter(w => w.type === type);
        const targetWorkouts = 3; // Target 3 workouts per week per type
        return Math.min(100, Math.floor((typeWorkouts.length / targetWorkouts) * 100));
    }

    updateProgressBar(selector, progress, type) {
        const card = document.querySelector(selector);
        if (card) {
            const progressBar = card.querySelector('.progress-fill');
            const progressText = card.querySelector('p');
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
                progressBar.style.transition = 'width 0.5s ease';
            }
            
            if (progressText) {
                progressText.textContent = `${progress}% complete this week`;
            }
        }
    }

    updateNotifications() {
        try {
            const notifications = this.generateNotifications();
            const notificationList = document.querySelector('.notification-list');
            
            if (notificationList) {
                notificationList.innerHTML = '';
                notifications.forEach(notification => {
                    const notificationEl = document.createElement('div');
                    notificationEl.className = `notification-item ${notification.isNew ? 'new' : ''}`;
                    notificationEl.setAttribute('data-id', notification.id);
                    
                    const iconEl = document.createElement('div');
                    iconEl.className = 'notification-icon';
                    iconEl.innerHTML = `<i class="${this.sanitizeInput(notification.icon)}"></i>`;
                    
                    const contentEl = document.createElement('div');
                    contentEl.className = 'notification-content';
                    
                    const titleEl = document.createElement('span');
                    titleEl.className = 'notification-title';
                    titleEl.textContent = this.sanitizeInput(notification.title);
                    
                    const descEl = document.createElement('span');
                    descEl.className = 'notification-desc';
                    descEl.textContent = this.sanitizeInput(notification.desc);
                    
                    contentEl.appendChild(titleEl);
                    contentEl.appendChild(descEl);
                    
                    const timeEl = document.createElement('span');
                    timeEl.className = 'notification-time';
                    timeEl.textContent = this.sanitizeInput(notification.time);
                    
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'notification-close';
                    closeBtn.textContent = '×';
                    closeBtn.addEventListener('click', () => this.dismissNotification(notification.id));
                    
                    notificationEl.appendChild(iconEl);
                    notificationEl.appendChild(contentEl);
                    notificationEl.appendChild(timeEl);
                    notificationEl.appendChild(closeBtn);
                    
                    notificationList.appendChild(notificationEl);
                });
            }
        } catch (error) {
            console.error('Error updating notifications:', error);
        }
    }

    generateNotifications() {
        const notifications = [];
        const now = new Date();
        
        // Achievement notifications
        const weekWorkouts = this.workoutData.filter(w => {
            const workoutDate = new Date(w.date);
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return workoutDate >= weekStart;
        });
        
        if (weekWorkouts.length >= 5) {
            notifications.push({
                id: 'achievement_5_workouts',
                icon: 'fas fa-trophy',
                title: 'Achievement Unlocked!',
                desc: "You've completed 5 workouts this week",
                time: '2m ago',
                isNew: true
            });
        }
        
        // Reminder notifications
        const nextWorkout = this.getNextScheduledWorkout();
        if (nextWorkout) {
            notifications.push({
                id: 'workout_reminder',
                icon: 'fas fa-calendar',
                title: 'Workout Reminder',
                desc: `${nextWorkout.type} training in 30 minutes`,
                time: '25m ago',
                isNew: false
            });
        }
        
        // Goal progress notifications
        const user = auth.getCurrentUser();
        if (user && user.profile.goals) {
            user.profile.goals.forEach(goal => {
                const progress = (goal.current / goal.target) * 100;
                if (progress >= 90 && progress < 100) {
                    notifications.push({
                        id: `goal_almost_${goal.type}`,
                        icon: 'fas fa-target',
                        title: 'Almost There!',
                        desc: `You're ${Math.round(100 - progress)}% away from your ${goal.type} goal`,
                        time: '1h ago',
                        isNew: true
                    });
                }
            });
        }
        
        return notifications.slice(0, 5); // Limit to 5 notifications
    }

    getNextScheduledWorkout() {
        // Mock next workout - in real app, this would come from calendar data
        const workoutTypes = ['Upper Body', 'Lower Body', 'Cardio', 'Full Body'];
        return {
            type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
            time: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        };
    }

    dismissNotification(notificationId) {
        try {
            const sanitizedId = this.sanitizeInput(notificationId);
            const notification = document.querySelector(`[data-id="${sanitizedId}"]`);
            if (notification) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        } catch (error) {
            console.error('Error dismissing notification:', error);
        }
    }

    updateRecentActivity() {
        try {
            // Update the running activity preview with real data
            const recentRun = this.runData[0]; // Most recent run
            if (recentRun) {
                const preview = document.querySelector('.run-activity-preview small');
                if (preview) {
                    const runDate = new Date(recentRun.date);
                    const timeStr = runDate.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    });
                    preview.textContent = `${runDate.toLocaleDateString()}, ${timeStr} — ${this.sanitizeInput(String(recentRun.distance))} km`;
                }
            }
        } catch (error) {
            console.error('Error updating recent activity:', error);
        }
    }

    generateInsights() {
        // Generate AI-like insights based on user data
        const insights = [];
        
        // Workout consistency insight
        const recentWorkouts = this.workoutData.filter(w => {
            const workoutDate = new Date(w.date);
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
            return workoutDate >= twoWeeksAgo;
        });
        
        if (recentWorkouts.length >= 8) {
            insights.push({
                type: 'positive',
                message: 'Great consistency! You\'re maintaining an excellent workout routine.'
            });
        } else if (recentWorkouts.length < 4) {
            insights.push({
                type: 'suggestion',
                message: 'Try to aim for at least 3-4 workouts per week for optimal results.'
            });
        }
        
        // Store insights for display in other components
        localStorage.setItem('userInsights', JSON.stringify(insights));
    }

    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('Working offline', 'warning');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshDashboard();
                        break;
                    case 'e':
                        e.preventDefault();
                        window.location.href = 'exercise.html';
                        break;
                    case 'n':
                        e.preventDefault();
                        window.location.href = 'nutrition.html';
                        break;
                }
            }
        });
        
        // Auto-refresh dashboard every 5 minutes
        setInterval(() => {
            if (this.isOnline) {
                this.updateDashboard();
            }
        }, 5 * 60 * 1000);

        // Initialize continue buttons
        this.initializeContinueButtons();
    }

    initializeContinueButtons() {
        const continueButtons = document.querySelectorAll('.continue-btn');
        continueButtons.forEach(button => {
            button.addEventListener('click', function() {
                window.location.href = 'exercise.html';
            });
        });
    }

    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    checkForUpdates() {
        // Check for app updates (mock implementation)
        const currentVersion = '2.1.0';
        const storedVersion = localStorage.getItem('appVersion');
        
        if (storedVersion && storedVersion !== currentVersion) {
            this.showToast('App updated to version ' + currentVersion, 'info');
        }
        
        localStorage.setItem('appVersion', currentVersion);
    }

    refreshDashboard() {
        this.showToast('Refreshing dashboard...', 'info');
        this.updateDashboard();
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }

    showToast(message, type = 'info') {
        if (typeof auth !== 'undefined' && auth.showToast) {
            auth.showToast(message, type);
        }
    }

    handleError(message, error) {
        console.error(message, error);
        this.showToast(message, 'error');
    }

    // Export data functionality
    exportUserData() {
        const userData = {
            workouts: this.workoutData,
            runs: this.runData,
            nutrition: this.nutritionData,
            user: auth.getCurrentUser(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    }

    // Import data functionality
    importUserData(file) {
        try {
            if (!file || file.type !== 'application/json') {
                this.showToast('Please select a valid JSON file', 'error');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showToast('File too large. Maximum size is 10MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate and sanitize imported data
                    if (data.workouts && Array.isArray(data.workouts)) {
                        this.workoutData = this.sanitizeArray(data.workouts);
                    }
                    if (data.runs && Array.isArray(data.runs)) {
                        this.runData = this.sanitizeArray(data.runs);
                    }
                    if (data.nutrition && typeof data.nutrition === 'object') {
                        this.nutritionData = this.sanitizeObject(data.nutrition);
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('workoutData', JSON.stringify(this.workoutData));
                    localStorage.setItem('runData', JSON.stringify(this.runData));
                    localStorage.setItem('nutritionData', JSON.stringify(this.nutritionData));
                    
                    this.updateDashboard();
                    this.showToast('Data imported successfully!', 'success');
                } catch (error) {
                    this.handleError('Failed to import data - invalid format', error);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            this.handleError('Failed to import data', error);
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

    // Sanitize array elements
    sanitizeArray(arr) {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => this.sanitizeObject(item));
    }
}

// Global functions for HTML onclick handlers
function exportData() {
    app.exportUserData();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            app.importUserData(file);
        }
    };
    input.click();
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FitnessApp();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: var(--muted);
        cursor: pointer;
        font-size: 1.2rem;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .notification-close:hover {
        background: var(--glass);
        color: var(--text);
    }
    
    .notification-item {
        position: relative;
    }
`;
document.head.appendChild(style);