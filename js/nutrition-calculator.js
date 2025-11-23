function initializeNutritionCalculator() {
    const container = document.getElementById('nutrition-calc');
    container.innerHTML = `
        <div class="nutrition-form">
            <div class="input-group">
                <input type="number" id="weight" placeholder="Weight (kg)" class="form-input" />
                <input type="number" id="height" placeholder="Height (cm)" class="form-input" />
            </div>
            <button onclick="calculateBMI()" class="btn-primary">Calculate BMI</button>
            <div id="bmi-result" class="bmi-result"></div>
        </div>
    `;
}

function calculateBMI() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value / 100;
    
    if (weight && height) {
        const bmi = (weight / (height * height)).toFixed(1);
        const category = getBMICategory(bmi);
        const cls = getBMIClass(bmi);
        
        document.getElementById('bmi-result').innerHTML = `
            <div class="bmi-card">
                <div class="bmi-value ${cls}">${bmi}</div>
                <div class="bmi-category ${cls}">${category}</div>
            </div>
        `;
    }
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getBMIColor(bmi) {
    // Deprecated - color handled via classes in CSS now
    if (bmi < 18.5) return 'bmi-underweight';
    if (bmi < 25) return 'bmi-normal';
    if (bmi < 30) return 'bmi-overweight';
    return 'bmi-obese';
}

function getBMIClass(bmi) {
    if (bmi < 18.5) return 'bmi-underweight';
    if (bmi < 25) return 'bmi-normal';
    if (bmi < 30) return 'bmi-overweight';
    return 'bmi-obese';
}