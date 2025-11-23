const workoutData = {
    weekly: {
        steps: [8542, 7234, 9876, 6543, 8901, 7654, 8234],
        calories: [420, 380, 510, 340, 460, 390, 430],
        workouts: [3, 2, 4, 1, 3, 2, 3]
    },
    exercises: [
        { name: 'Running', duration: 30, calories: 300 },
        { name: 'Push-ups', sets: 3, reps: 15 },
        { name: 'Squats', sets: 3, reps: 20 }
    ]
};

function getWeeklyData() {
    return workoutData.weekly;
}

function getTodayStats() {
    return {
        steps: workoutData.weekly.steps[6],
        calories: workoutData.weekly.calories[6],
        workouts: workoutData.weekly.workouts[6]
    };
}