// filter.js
// Exposes filterExercises(filter, button) used by the Exercise page filter buttons.
function filterExercises(filter, button) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
    
    const container = document.querySelector('.exercise-categories');
    if (!container) return;
    
    if (filter === 'beginner') {
        container.innerHTML = `
            <div class="category-card">
                <div class="category-header">
                    <h3><i class="fas fa-dumbbell"></i> Beginner Upper Body</h3>
                </div>
                <div class="exercise-grid">
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Wall Push-ups</span>
                            <span class="exercise-target">Chest, Arms</span>
                        </div>
                        <span class="exercise-sets">2x8</span>
                    </div>
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Arm Circles</span>
                            <span class="exercise-target">Shoulders</span>
                        </div>
                        <span class="exercise-sets">2x10</span>
                    </div>
                </div>
            </div>`;
    } else if (filter === 'intermediate') {
        container.innerHTML = `
            <div class="category-card">
                <div class="category-header">
                    <h3><i class="fas fa-dumbbell"></i> Intermediate Workouts</h3>
                </div>
                <div class="exercise-grid">
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Push-ups</span>
                            <span class="exercise-target">Chest, Triceps</span>
                        </div>
                        <span class="exercise-sets">3x15</span>
                    </div>
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Squats</span>
                            <span class="exercise-target">Quads, Glutes</span>
                        </div>
                        <span class="exercise-sets">3x20</span>
                    </div>
                </div>
            </div>`;
    } else if (filter === 'advanced') {
        container.innerHTML = `
            <div class="category-card">
                <div class="category-header">
                    <h3><i class="fas fa-fire"></i> Advanced Workouts</h3>
                </div>
                <div class="exercise-grid">
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Burpees</span>
                            <span class="exercise-target">Full Body</span>
                        </div>
                        <span class="exercise-sets">4x12</span>
                    </div>
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Pistol Squats</span>
                            <span class="exercise-target">Legs, Balance</span>
                        </div>
                        <span class="exercise-sets">3x8</span>
                    </div>
                </div>
            </div>`;
    } else {
        // default / all
        container.innerHTML = `
            <div class="category-card">
                <div class="category-header">
                    <h3><i class="fas fa-dumbbell"></i> Upper Body</h3>
                    <span class="difficulty beginner">Beginner</span>
                </div>
                <div class="exercise-grid">
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Push-ups</span>
                            <span class="exercise-target">Chest, Triceps</span>
                        </div>
                        <span class="exercise-sets">3x15</span>
                    </div>
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Pull-ups</span>
                            <span class="exercise-target">Back, Biceps</span>
                        </div>
                        <span class="exercise-sets">3x8</span>
                    </div>
                </div>
            </div>
            <div class="category-card">
                <div class="category-header">
                    <h3><i class="fas fa-running"></i> Lower Body</h3>
                    <span class="difficulty intermediate">Intermediate</span>
                </div>
                <div class="exercise-grid">
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Squats</span>
                            <span class="exercise-target">Quads, Glutes</span>
                        </div>
                        <span class="exercise-sets">3x20</span>
                    </div>
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <span class="exercise-name">Lunges</span>
                            <span class="exercise-target">Legs, Glutes</span>
                        </div>
                        <span class="exercise-sets">3x15</span>
                    </div>
                </div>
            </div>`;
    }
}
