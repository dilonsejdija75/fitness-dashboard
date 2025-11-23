/**
 * Analytics Dashboard
 * Handles data visualization, charts, and performance insights
 */

class AnalyticsDashboard {
    constructor() {
        this.currentRange = 7;
        this.charts = {};
        try {
            this.workoutData = JSON.parse(localStorage.getItem('workoutData') || '[]');
            this.runData = JSON.parse(localStorage.getItem('runData') || '[]');
        } catch (error) {
            console.error('Error parsing stored data:', error);
            this.workoutData = [];
            this.runData = [];
        }
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserInfo();
        this.generateSampleData();
        this.updateMetrics();
        this.initializeCharts();
        this.updateInsights();
    }

    setupEventListeners() {
        try {
            // Time range buttons
            document.querySelectorAll('.range-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    const range = parseInt(e.target.dataset.range);
                    if (!isNaN(range) && range > 0 && range <= 365) {
                        this.currentRange = range;
                        this.updateMetrics();
                        this.updateCharts();
                    }
                });
            });

            // Chart type selector
            const chartTypeSelector = document.getElementById('workoutChartType');
            if (chartTypeSelector) {
                chartTypeSelector.addEventListener('change', (e) => {
                    const validTypes = ['line', 'bar', 'area'];
                    if (validTypes.includes(e.target.value)) {
                        this.updateWorkoutChart(e.target.value);
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    loadUserInfo() {
        try {
            const user = auth.getCurrentUser();
            if (user) {
                const userName = document.getElementById('userName');
                const userAvatar = document.getElementById('userAvatar');
                if (userName) userName.textContent = `${this.sanitizeInput(user.firstName)} ${this.sanitizeInput(user.lastName)}`;
                if (userAvatar) userAvatar.textContent = this.sanitizeInput(user.firstName).charAt(0).toUpperCase();
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }

    generateSampleData() {
        // Generate sample workout data if none exists
        if (this.workoutData.length === 0) {
            const workoutTypes = ['Upper Body', 'Lower Body', 'Cardio', 'Full Body'];
            const now = new Date();
            
            for (let i = 0; i < 30; i++) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                if (Math.random() > 0.3) { // 70% chance of workout
                    this.workoutData.push({
                        id: Date.now() + i,
                        date: date.toISOString(),
                        type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
                        duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
                        calories: Math.floor(Math.random() * 400) + 200, // 200-600 calories
                        exercises: Math.floor(Math.random() * 8) + 3 // 3-10 exercises
                    });
                }
            }
            localStorage.setItem('workoutData', JSON.stringify(this.workoutData));
        }

        // Generate sample run data if none exists
        if (this.runData.length === 0) {
            const now = new Date();
            
            for (let i = 0; i < 20; i++) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                if (Math.random() > 0.6) { // 40% chance of run
                    this.runData.push({
                        id: Date.now() + i,
                        date: date.toISOString(),
                        distance: (Math.random() * 8 + 2).toFixed(2), // 2-10 km
                        duration: Math.floor(Math.random() * 3600) + 1200, // 20-80 minutes
                        pace: (Math.random() * 2 + 4).toFixed(2), // 4-6 min/km
                        calories: Math.floor(Math.random() * 500) + 300
                    });
                }
            }
            localStorage.setItem('runData', JSON.stringify(this.runData));
        }
    }

    getFilteredData() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.currentRange);

        const filteredWorkouts = this.workoutData.filter(w => new Date(w.date) >= cutoffDate);
        const filteredRuns = this.runData.filter(r => new Date(r.date) >= cutoffDate);

        return { workouts: filteredWorkouts, runs: filteredRuns };
    }

    updateMetrics() {
        try {
            const { workouts, runs } = this.getFilteredData();
            const allActivities = [...workouts, ...runs];

            // Total workouts
            const totalWorkouts = allActivities.length;
            const totalWorkoutsEl = document.getElementById('totalWorkouts');
            if (totalWorkoutsEl) totalWorkoutsEl.textContent = totalWorkouts;

            // Total calories
            const totalCalories = allActivities.reduce((sum, activity) => sum + (activity.calories || 0), 0);
            const totalCaloriesEl = document.getElementById('totalCalories');
            if (totalCaloriesEl) totalCaloriesEl.textContent = totalCalories.toLocaleString();

            // Total time
            const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0) + 
                               runs.reduce((sum, r) => sum + Math.floor(r.duration / 60), 0);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const totalTimeEl = document.getElementById('totalTime');
            if (totalTimeEl) totalTimeEl.textContent = `${hours}h ${minutes}m`;

            // Goal progress (mock calculation)
            const goalProgress = Math.min(100, Math.floor((totalWorkouts / (this.currentRange * 0.5)) * 100));
            const goalProgressEl = document.getElementById('goalProgress');
            if (goalProgressEl) goalProgressEl.textContent = `${goalProgress}%`;

            // Calculate changes (mock data for demo)
            this.updateMetricChanges(totalWorkouts, totalCalories, totalMinutes, goalProgress);
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    updateMetricChanges(workouts, calories, time, progress) {
        // Mock percentage changes for demo
        const changes = {
            workout: Math.floor(Math.random() * 20) + 5,
            calorie: Math.floor(Math.random() * 15) + 3,
            time: Math.floor(Math.random() * 25) + 2,
            goal: Math.floor(Math.random() * 10) + 1
        };

        document.getElementById('workoutChange').textContent = `+${changes.workout}%`;
        document.getElementById('calorieChange').textContent = `+${changes.calorie}%`;
        document.getElementById('timeChange').textContent = `+${changes.time}%`;
        document.getElementById('goalChange').textContent = `+${changes.goal}%`;
    }

    initializeCharts() {
        this.createWorkoutChart();
        this.createCaloriesChart();
        this.createExerciseDistributionChart();
        this.createProgressChart();
    }

    createWorkoutChart() {
        const ctx = document.getElementById('workoutChart').getContext('2d');
        const { workouts } = this.getFilteredData();

        // Group workouts by date
        const workoutsByDate = {};
        workouts.forEach(workout => {
            const date = new Date(workout.date).toDateString();
            workoutsByDate[date] = (workoutsByDate[date] || 0) + 1;
        });

        // Generate labels and data for the last N days
        const labels = [];
        const data = [];
        
        for (let i = this.currentRange - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(workoutsByDate[dateStr] || 0);
        }

        this.charts.workout = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Workouts',
                    data: data,
                    borderColor: '#2fb4ff',
                    backgroundColor: 'rgba(47, 180, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e7f0fa' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#93a6b8' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    x: {
                        ticks: { color: '#93a6b8' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });
    }

    createCaloriesChart() {
        const ctx = document.getElementById('caloriesChart').getContext('2d');
        const { workouts, runs } = this.getFilteredData();

        // Group calories by date
        const caloriesByDate = {};
        [...workouts, ...runs].forEach(activity => {
            const date = new Date(activity.date).toDateString();
            caloriesByDate[date] = (caloriesByDate[date] || 0) + (activity.calories || 0);
        });

        const labels = [];
        const data = [];
        
        for (let i = this.currentRange - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(caloriesByDate[dateStr] || 0);
        }

        this.charts.calories = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calories Burned',
                    data: data,
                    backgroundColor: 'rgba(0, 191, 166, 0.8)',
                    borderColor: '#00bfa6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e7f0fa' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#93a6b8' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    x: {
                        ticks: { color: '#93a6b8' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });
    }

    createExerciseDistributionChart() {
        const ctx = document.getElementById('exerciseDistributionChart').getContext('2d');
        const { workouts } = this.getFilteredData();

        // Count workout types
        const typeCount = {};
        workouts.forEach(workout => {
            typeCount[workout.type] = (typeCount[workout.type] || 0) + 1;
        });

        const labels = Object.keys(typeCount);
        const data = Object.values(typeCount);
        const colors = ['#2fb4ff', '#00bfa6', '#f59e0b', '#ef4444', '#8b5cf6'];

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#0f2636',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e7f0fa', padding: 20 }
                    }
                }
            }
        });
    }

    createProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        // Mock progress data
        const labels = [];
        const weightData = [];
        const strengthData = [];
        
        for (let i = this.currentRange - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Mock progressive data
            weightData.push(75 - (i * 0.1) + (Math.random() * 0.5 - 0.25));
            strengthData.push(100 + (this.currentRange - i) * 2 + (Math.random() * 5 - 2.5));
        }

        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Weight (kg)',
                        data: weightData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Strength Score',
                        data: strengthData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#e7f0fa' }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { color: '#93a6b8' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#93a6b8' },
                        grid: { drawOnChartArea: false }
                    },
                    x: {
                        ticks: { color: '#93a6b8' },
                        grid: { color: 'rgba(255,255,255,0.06)' }
                    }
                }
            }
        });
    }

    updateCharts() {
        // Destroy existing charts and recreate with new data
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.charts = {};
        this.initializeCharts();
    }

    updateWorkoutChart(type) {
        if (this.charts.workout) {
            this.charts.workout.config.type = type;
            this.charts.workout.update();
        }
    }

    updateInsights() {
        try {
            const { workouts, runs } = this.getFilteredData();
            const insights = this.generateInsights(workouts, runs);
            
            const insightsContainer = document.getElementById('performanceInsights');
            if (insightsContainer) {
                insightsContainer.innerHTML = insights.map(insight => `
                    <div class="insight-item">
                        <span class="insight-icon">${this.sanitizeInput(insight.icon)}</span>
                        <div class="insight-content">
                            <h4>${this.sanitizeInput(insight.title)}</h4>
                            <p>${this.sanitizeInput(insight.description)}</p>
                        </div>
                    </div>
                `).join('');
            }

            this.updateGoalProgress();
            this.updateRecommendations();
        } catch (error) {
            console.error('Error updating insights:', error);
        }
    }

    generateInsights(workouts, runs) {
        const insights = [];
        const totalActivities = workouts.length + runs.length;
        const avgWorkoutsPerWeek = (totalActivities / this.currentRange) * 7;

        insights.push({
            icon: '📈',
            title: 'Workout Consistency',
            description: `You've maintained an average of ${avgWorkoutsPerWeek.toFixed(1)} activities per week.`
        });

        if (workouts.length > 0) {
            const avgDuration = workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length;
            insights.push({
                icon: '⏱️',
                title: 'Average Session Length',
                description: `Your average workout duration is ${Math.round(avgDuration)} minutes.`
            });
        }

        if (runs.length > 0) {
            const totalDistance = runs.reduce((sum, r) => sum + parseFloat(r.distance), 0);
            insights.push({
                icon: '🏃',
                title: 'Running Progress',
                description: `You've covered ${totalDistance.toFixed(1)} km in total running distance.`
            });
        }

        return insights;
    }

    updateGoalProgress() {
        try {
            const user = auth.getCurrentUser();
            if (!user || !user.profile || !user.profile.goals) return;

            const goalsList = document.getElementById('goalProgressList');
            if (goalsList) {
                goalsList.innerHTML = user.profile.goals.map(goal => {
                    const progress = Math.min(100, (goal.current / goal.target) * 100);
                    return `
                        <div class="goal-progress-item">
                            <div class="goal-info">
                                <h4>${this.sanitizeInput(goal.type.replace('_', ' ').toUpperCase())}</h4>
                                <span>${goal.current} / ${goal.target} ${this.sanitizeInput(goal.unit)}</span>
                            </div>
                            <div class="goal-progress-bar">
                                <div class="progress-fill" style="width: ${Math.round(progress)}%"></div>
                            </div>
                            <span class="progress-percentage">${Math.round(progress)}%</span>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error updating goal progress:', error);
        }
    }

    updateRecommendations() {
        try {
            const { workouts } = this.getFilteredData();
            const recommendations = [];

            // Analyze workout patterns
            const workoutTypes = {};
            workouts.forEach(w => {
                workoutTypes[w.type] = (workoutTypes[w.type] || 0) + 1;
            });

            const totalWorkouts = workouts.length;
            const cardioCount = workoutTypes['Cardio'] || 0;
            const strengthCount = (workoutTypes['Upper Body'] || 0) + (workoutTypes['Lower Body'] || 0);

            if (cardioCount < totalWorkouts * 0.3) {
                recommendations.push({
                    icon: '❤️',
                    title: 'Increase Cardio',
                    description: 'Consider adding more cardio sessions to improve cardiovascular health.'
                });
            }

            if (strengthCount < totalWorkouts * 0.4) {
                recommendations.push({
                    icon: '💪',
                    title: 'Strength Training',
                    description: 'Add more strength training to build muscle and improve metabolism.'
                });
            }

            if (totalWorkouts < this.currentRange * 0.4) {
                recommendations.push({
                    icon: '📅',
                    title: 'Consistency',
                    description: 'Try to maintain at least 3-4 workout sessions per week for optimal results.'
                });
            }

            const recommendationsList = document.getElementById('recommendationsList');
            if (recommendationsList) {
                recommendationsList.innerHTML = recommendations.map(rec => `
                    <div class="recommendation-item">
                        <span class="recommendation-icon">${this.sanitizeInput(rec.icon)}</span>
                        <div class="recommendation-content">
                            <h4>${this.sanitizeInput(rec.title)}</h4>
                            <p>${this.sanitizeInput(rec.description)}</p>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error updating recommendations:', error);
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
}

// Export functions
function exportData(format) {
    const analytics = new AnalyticsDashboard();
    const { workouts, runs } = analytics.getFilteredData();
    
    if (format === 'csv') {
        exportToCSV(workouts, runs);
    } else if (format === 'pdf') {
        exportToPDF(workouts, runs);
    }
}

function exportToCSV(workouts, runs) {
    if (workouts.length === 0 && runs.length === 0) {
        showToast('No data to export!', 'warning');
        return;
    }
    
    let csvContent = "Type,Date,Duration (min),Calories,Details,Exercises/Distance\n";
    
    workouts.forEach(workout => {
        const date = new Date(workout.date).toLocaleDateString();
        const exercises = workout.exercises || 'N/A';
        csvContent += `Workout,${date},${workout.duration},${workout.calories},"${workout.type}",${exercises}\n`;
    });
    
    runs.forEach(run => {
        const date = new Date(run.date).toLocaleDateString();
        const duration = Math.floor(run.duration/60);
        csvContent += `Run,${date},${duration},${run.calories},"Running","${run.distance}km"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Data exported to CSV successfully!', 'success');
}

function exportToPDF(workouts, runs) {
    if (workouts.length === 0 && runs.length === 0) {
        showToast('No data to export!', 'warning');
        return;
    }
    
    const totalCalories = [...workouts, ...runs].reduce((sum, a) => sum + (a.calories || 0), 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0) + runs.reduce((sum, r) => sum + Math.floor(r.duration/60), 0);
    const totalDistance = runs.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0);
    
    const content = `FITNESS TRACKER REPORT
${'='.repeat(50)}
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

SUMMARY:
${'-'.repeat(20)}
Total Activities: ${workouts.length + runs.length}
Total Workouts: ${workouts.length}
Total Runs: ${runs.length}
Total Calories Burned: ${totalCalories.toLocaleString()}
Total Duration: ${Math.floor(totalDuration/60)}h ${totalDuration%60}m
Total Distance: ${totalDistance.toFixed(2)}km

WORKOUT DETAILS:
${'-'.repeat(20)}
${workouts.length > 0 ? workouts.map(w => `${new Date(w.date).toLocaleDateString()} - ${w.type} (${w.duration}min, ${w.calories}cal)`).join('\n') : 'No workouts recorded'}

RUN DETAILS:
${'-'.repeat(20)}
${runs.length > 0 ? runs.map(r => `${new Date(r.date).toLocaleDateString()} - ${r.distance}km (${Math.floor(r.duration/60)}min, ${r.calories}cal, ${r.pace}min/km)`).join('\n') : 'No runs recorded'}

${'='.repeat(50)}
Report generated by FitTracker Pro`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Report exported successfully!', 'success');
}

function showToast(message, type) {
    if (typeof auth !== 'undefined' && auth.showToast) {
        auth.showToast(message, type);
    } else {
        // Fallback toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card);
            color: var(--text);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 10000;
            border-left: 4px solid ${type === 'success' ? 'var(--accent-2)' : type === 'warning' ? 'var(--warn)' : 'var(--danger)'};
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize analytics dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsDashboard();
});