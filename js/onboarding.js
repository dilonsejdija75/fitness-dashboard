/**
 * Onboarding Tour System
 * Provides guided tours for new users
 */

class OnboardingTour {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.overlay = null;
        this.tooltip = null;
        this.isActive = false;
    }

    // Define tour steps for different pages
    defineTour(page) {
        const tours = {
            dashboard: [
                {
                    element: '.quick-stats',
                    title: 'Quick Stats',
                    content: 'View your daily fitness metrics at a glance. These update in real-time as you log activities.',
                    position: 'bottom'
                },
                {
                    element: '.progress-section',
                    title: 'Progress Tracking',
                    content: 'Monitor your weekly workout progress. Click "Continue Exercise" to add more workouts.',
                    position: 'bottom'
                },
                {
                    element: '.fitness-goals-section',
                    title: 'Set Goals',
                    content: 'Define your fitness objectives here. Set distance, duration, or calorie targets.',
                    position: 'top'
                },
                {
                    element: '.global-search-btn',
                    title: 'Global Search',
                    content: 'Use this button or press Ctrl+K to search across all your fitness data.',
                    position: 'left'
                }
            ],
            exercise: [
                {
                    element: '.workout-header',
                    title: 'Workout Overview',
                    content: 'See your planned exercises and estimated duration before starting.',
                    position: 'bottom'
                },
                {
                    element: '.exercise-categories',
                    title: 'Exercise Categories',
                    content: 'Browse exercises by body part and difficulty level.',
                    position: 'bottom'
                },
                {
                    element: '.exercise-filters',
                    title: 'Filter Exercises',
                    content: 'Filter exercises by difficulty to match your fitness level.',
                    position: 'top'
                }
            ],
            nutrition: [
                {
                    element: '.nutrition-overview',
                    title: 'Daily Nutrition',
                    content: 'Track your daily calorie and macro intake with visual progress rings.',
                    position: 'bottom'
                },
                {
                    element: '.meal-planning',
                    title: 'Meal Planning',
                    content: 'Log your meals throughout the day and track nutritional content.',
                    position: 'bottom'
                },
                {
                    element: '.water-tracking',
                    title: 'Water Intake',
                    content: 'Stay hydrated by tracking your daily water consumption.',
                    position: 'top'
                }
            ]
        };

        this.steps = tours[page] || [];
        return this.steps.length > 0;
    }

    start(page = 'dashboard') {
        if (!this.defineTour(page)) {
            console.warn(`No tour defined for page: ${page}`);
            return;
        }

        // Check if user has seen this tour
        const tourKey = `tour_${page}_completed`;
        if (localStorage.getItem(tourKey) === 'true') {
            return;
        }

        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        this.overlay.innerHTML = `
            <div class="tour-backdrop"></div>
        `;
        document.body.appendChild(this.overlay);

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';
        document.body.appendChild(this.tooltip);
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[this.currentStep];
        const element = document.querySelector(step.element);

        if (!element) {
            console.warn(`Element not found: ${step.element}`);
            this.next();
            return;
        }

        this.highlightElement(element);
        this.showTooltip(element, step);
    }

    highlightElement(element) {
        // Remove previous highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        // Add highlight to current element
        element.classList.add('tour-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showTooltip(element, step) {
        const rect = element.getBoundingClientRect();
        const tooltip = this.tooltip;

        tooltip.innerHTML = `
            <div class="tour-tooltip-content">
                <div class="tour-header">
                    <h3>${step.title}</h3>
                    <button class="tour-close" onclick="onboardingTour.skip()">&times;</button>
                </div>
                <div class="tour-body">
                    <p>${step.content}</p>
                </div>
                <div class="tour-footer">
                    <div class="tour-progress">
                        <span>${this.currentStep + 1} of ${this.steps.length}</span>
                        <div class="progress-dots">
                            ${this.steps.map((_, i) => 
                                `<div class="dot ${i === this.currentStep ? 'active' : i < this.currentStep ? 'completed' : ''}"></div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="tour-actions">
                        ${this.currentStep > 0 ? '<button class="tour-btn-secondary" onclick="onboardingTour.previous()">Previous</button>' : ''}
                        <button class="tour-btn-primary" onclick="onboardingTour.next()">
                            ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(tooltip, element, step.position);
        tooltip.classList.add('show');
    }

    positionTooltip(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const margin = 20;

        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - margin;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + margin;
                break;
            default:
                top = rect.bottom + margin;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        // Ensure tooltip stays within viewport
        top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
        left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin));

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    next() {
        this.currentStep++;
        this.showStep();
    }

    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    skip() {
        this.complete();
    }

    complete() {
        this.isActive = false;
        
        // Mark tour as completed
        const page = this.getCurrentPage();
        localStorage.setItem(`tour_${page}_completed`, 'true');

        // Clean up
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }

        // Remove highlights
        document.querySelectorAll('.tour-highlight').forEach(el => {
            el.classList.remove('tour-highlight');
        });

        // Show completion message
        if (typeof professionalEnhancements !== 'undefined') {
            professionalEnhancements.showToast('Tour completed! You can restart it anytime from the help menu.', 'success');
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('exercise')) return 'exercise';
        if (path.includes('nutrition')) return 'nutrition';
        if (path.includes('analytics')) return 'analytics';
        if (path.includes('calendar')) return 'calendar';
        if (path.includes('run-tracker')) return 'run-tracker';
        return 'dashboard';
    }

    // Reset tour for testing
    resetTour(page) {
        localStorage.removeItem(`tour_${page}_completed`);
    }

    // Check if user is new (no tours completed)
    isNewUser() {
        const pages = ['dashboard', 'exercise', 'nutrition', 'analytics'];
        return !pages.some(page => localStorage.getItem(`tour_${page}_completed`) === 'true');
    }
}

// Initialize onboarding tour
const onboardingTour = new OnboardingTour();

// Auto-start tour for new users
document.addEventListener('DOMContentLoaded', function() {
    // Start tour after a short delay to ensure page is fully loaded
    setTimeout(() => {
        if (onboardingTour.isNewUser()) {
            const page = onboardingTour.getCurrentPage();
            onboardingTour.start(page);
        }
    }, 1000);
});

// Add tour styles
const tourStyles = document.createElement('style');
tourStyles.textContent = `
.tour-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
}

.tour-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
}

.tour-highlight {
    position: relative;
    z-index: 10000;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5) !important;
    border-radius: 8px;
}

.tour-tooltip {
    position: fixed;
    z-index: 10001;
    max-width: 350px;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--border);
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.2s ease;
    pointer-events: auto;
}

.tour-tooltip.show {
    opacity: 1;
    transform: scale(1);
}

.tour-tooltip-content {
    padding: 0;
}

.tour-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
}

.tour-header h3 {
    margin: 0;
    color: var(--text);
    font-size: 1.1rem;
    font-weight: 600;
}

.tour-close {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
}

.tour-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text);
}

.tour-body {
    padding: 1.5rem;
}

.tour-body p {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
}

.tour-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tour-progress {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--muted);
}

.progress-dots {
    display: flex;
    gap: 0.5rem;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.2s ease;
}

.dot.active {
    background: var(--accent);
}

.dot.completed {
    background: var(--accent-2);
}

.tour-actions {
    display: flex;
    gap: 0.5rem;
}

.tour-btn-primary, .tour-btn-secondary {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.tour-btn-primary {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
    color: white;
    border: none;
}

.tour-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tour-btn-secondary {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
}

.tour-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
}

@media (max-width: 768px) {
    .tour-tooltip {
        max-width: calc(100vw - 2rem);
        margin: 1rem;
    }
    
    .tour-footer {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .tour-actions {
        justify-content: space-between;
    }
}
`;
document.head.appendChild(tourStyles);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OnboardingTour;
}