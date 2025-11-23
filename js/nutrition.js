/**
 * Nutrition Tracking System
 * Handles meal planning, food search, macro tracking, and nutrition insights
 */

class NutritionTracker {
    constructor() {
        try {
            this.nutritionData = JSON.parse(localStorage.getItem('nutritionData') || '{}');
        } catch (error) {
            console.error('Error parsing nutrition data:', error);
            this.nutritionData = {};
        }
        this.foodDatabase = this.initializeFoodDatabase();
        this.dailyGoals = {
            calories: 2200,
            protein: 150,
            carbs: 275,
            fat: 73,
            water: 3000 // ml
        };
        this.currentWaterIntake = parseInt(localStorage.getItem('waterIntake') || '0');
        this.init();
    }

    init() {
        this.loadUserInfo();
        this.updateMacroDisplay();
        this.updateWaterDisplay();
        this.generateInsights();
        this.setupEventListeners();
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

    initializeFoodDatabase() {
        return [
            // Proteins
            { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100g' },
            { name: 'Chicken Thigh', calories: 209, protein: 26, carbs: 0, fat: 11, per: '100g' },
            { name: 'Ground Beef', calories: 250, protein: 26, carbs: 0, fat: 15, per: '100g' },
            { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, per: '100g' },
            { name: 'Tuna', calories: 144, protein: 30, carbs: 0, fat: 0.8, per: '100g' },
            { name: 'Cod', calories: 82, protein: 18, carbs: 0, fat: 0.7, per: '100g' },
            { name: 'Shrimp', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, per: '100g' },
            { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, per: '100g' },
            { name: 'Turkey Breast', calories: 135, protein: 30, carbs: 0, fat: 1, per: '100g' },
            { name: 'Pork Chop', calories: 231, protein: 23, carbs: 0, fat: 14, per: '100g' },
            { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, per: '100g' },
            
            // Dairy
            { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, per: '100g' },
            { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, per: '100ml' },
            { name: 'Cheese', calories: 113, protein: 25, carbs: 1, fat: 9, per: '100g' },
            { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, per: '100g' },
            
            // Grains & Carbs
            { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, per: '100g' },
            { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, per: '100g' },
            { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, per: '100g' },
            { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, per: '100g' },
            { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 4.2, per: '100g' },
            { name: 'White Bread', calories: 265, protein: 9, carbs: 49, fat: 3.2, per: '100g' },
            { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1.1, per: '100g' },
            { name: 'Bagel', calories: 250, protein: 10, carbs: 48, fat: 1.5, per: '100g' },
            
            // Vegetables
            { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, per: '100g' },
            { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, per: '100g' },
            { name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, per: '100g' },
            { name: 'Bell Pepper', calories: 31, protein: 1, carbs: 7, fat: 0.3, per: '100g' },
            { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, per: '100g' },
            { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 4, fat: 0.1, per: '100g' },
            { name: 'Lettuce', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, per: '100g' },
            { name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, per: '100g' },
            { name: 'Mushrooms', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, per: '100g' },
            
            // Fruits
            { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, per: '100g' },
            { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, per: '100g' },
            { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, per: '100g' },
            { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, per: '100g' },
            { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, per: '100g' },
            { name: 'Grapes', calories: 62, protein: 0.6, carbs: 16, fat: 0.2, per: '100g' },
            { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, per: '100g' },
            
            // Nuts & Seeds
            { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, per: '100g' },
            { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fat: 65, per: '100g' },
            { name: 'Peanuts', calories: 567, protein: 26, carbs: 16, fat: 49, per: '100g' },
            { name: 'Cashews', calories: 553, protein: 18, carbs: 30, fat: 44, per: '100g' },
            { name: 'Sunflower Seeds', calories: 584, protein: 21, carbs: 20, fat: 51, per: '100g' },
            
            // Potatoes & Starches
            { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, per: '100g' },
            { name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1, per: '100g' },
            { name: 'French Fries', calories: 365, protein: 4, carbs: 63, fat: 17, per: '100g' },
            
            // Common Foods
            { name: 'Pizza', calories: 266, protein: 11, carbs: 33, fat: 10, per: '100g' },
            { name: 'Hamburger', calories: 295, protein: 17, carbs: 29, fat: 14, per: '100g' },
            { name: 'Hot Dog', calories: 290, protein: 10, carbs: 4, fat: 26, per: '100g' },
            { name: 'Sandwich', calories: 250, protein: 12, carbs: 30, fat: 10, per: '100g' },
            { name: 'Cereal', calories: 379, protein: 8, carbs: 84, fat: 3, per: '100g' },
            { name: 'Granola', calories: 471, protein: 13, carbs: 64, fat: 20, per: '100g' },
            { name: 'Protein Bar', calories: 400, protein: 20, carbs: 40, fat: 15, per: '100g' },
            { name: 'Energy Drink', calories: 45, protein: 0, carbs: 11, fat: 0, per: '100ml' },
            { name: 'Soda', calories: 42, protein: 0, carbs: 11, fat: 0, per: '100ml' },
            { name: 'Coffee', calories: 2, protein: 0.3, carbs: 0, fat: 0, per: '100ml' },
            { name: 'Tea', calories: 1, protein: 0, carbs: 0.3, fat: 0, per: '100ml' }
        ];
    }

    setupEventListeners() {
        try {
            // Water intake buttons
            document.querySelectorAll('.water-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const match = e.target.textContent.match(/\d+/);
                    if (match) {
                        const amount = parseInt(match[0]);
                        if (!isNaN(amount) && amount > 0 && amount <= 2000) {
                            this.addWater(amount);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    getTodayData() {
        const today = new Date().toDateString();
        if (!this.nutritionData[today]) {
            this.nutritionData[today] = {
                meals: {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    snacks: []
                },
                water: 0,
                totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
            };
        }
        return this.nutritionData[today];
    }

    updateMacroDisplay() {
        const todayData = this.getTodayData();
        const totals = this.calculateDayTotals(todayData);

        // Update calorie ring
        const caloriePercentage = Math.min(100, (totals.calories / this.dailyGoals.calories) * 100);
        const ringChart = document.querySelector('.ring-chart');
        if (ringChart) {
            ringChart.style.background = `conic-gradient(var(--accent) 0deg ${caloriePercentage * 3.6}deg, var(--border) ${caloriePercentage * 3.6}deg 360deg)`;
        }

        // Update values
        document.querySelector('.ring-value').textContent = Math.round(totals.calories).toLocaleString();
        
        // Update macro breakdown
        const macroItems = document.querySelectorAll('.macro-item');
        if (macroItems.length >= 3) {
            macroItems[0].querySelector('.macro-value').textContent = `${Math.round(totals.carbs)}g`;
            macroItems[0].querySelector('.macro-percentage').textContent = `${Math.round((totals.carbs * 4 / totals.calories) * 100) || 0}%`;
            
            macroItems[1].querySelector('.macro-value').textContent = `${Math.round(totals.protein)}g`;
            macroItems[1].querySelector('.macro-percentage').textContent = `${Math.round((totals.protein * 4 / totals.calories) * 100) || 0}%`;
            
            macroItems[2].querySelector('.macro-value').textContent = `${Math.round(totals.fat)}g`;
            macroItems[2].querySelector('.macro-percentage').textContent = `${Math.round((totals.fat * 9 / totals.calories) * 100) || 0}%`;
        }

        // Update meal calories
        const mealCalories = {
            breakfast: this.calculateMealCalories(todayData.meals.breakfast),
            lunch: this.calculateMealCalories(todayData.meals.lunch),
            dinner: this.calculateMealCalories(todayData.meals.dinner),
            snacks: this.calculateMealCalories(todayData.meals.snacks)
        };

        document.querySelector('#breakfastItems').parentElement.querySelector('.meal-calories').textContent = `${mealCalories.breakfast} cal`;
        document.querySelector('#lunchItems').parentElement.querySelector('.meal-calories').textContent = `${mealCalories.lunch} cal`;
        document.querySelector('#dinnerItems').parentElement.querySelector('.meal-calories').textContent = `${mealCalories.dinner} cal`;
        document.querySelector('#snackItems').parentElement.querySelector('.meal-calories').textContent = `${mealCalories.snacks} cal`;
    }

    calculateDayTotals(dayData) {
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        Object.values(dayData.meals).forEach(meal => {
            meal.forEach(food => {
                totals.calories += food.calories || 0;
                totals.protein += food.protein || 0;
                totals.carbs += food.carbs || 0;
                totals.fat += food.fat || 0;
            });
        });

        return totals;
    }

    calculateMealCalories(meal) {
        return meal.reduce((total, food) => total + (food.calories || 0), 0);
    }

    addWater(amount) {
        this.currentWaterIntake += amount;
        localStorage.setItem('waterIntake', this.currentWaterIntake.toString());
        this.updateWaterDisplay();
    }

    updateWaterDisplay() {
        const percentage = Math.min(100, (this.currentWaterIntake / this.dailyGoals.water) * 100);
        const waterLevel = document.querySelector('.water-level');
        const waterAmount = document.querySelector('.water-amount');
        
        if (waterLevel) {
            waterLevel.style.height = `${percentage}%`;
        }
        
        if (waterAmount) {
            waterAmount.textContent = `${(this.currentWaterIntake / 1000).toFixed(1)}L / ${(this.dailyGoals.water / 1000)}L`;
        }
    }

    addFoodToMeal(mealType, food) {
        const todayData = this.getTodayData();
        todayData.meals[mealType].push(food);
        this.saveNutritionData();
        this.updateMealDisplay(mealType);
        this.updateMacroDisplay();
    }

    updateMealDisplay(mealType) {
        try {
            const todayData = this.getTodayData();
            const mealItems = todayData.meals[mealType];
            const container = document.getElementById(`${mealType}Items`);
            
            if (container) {
                container.innerHTML = mealItems.map(food => `
                    <div class="food-item">
                        <span class="food-name">${this.sanitizeInput(food.name)}</span>
                        <span class="food-calories">${Math.round(food.calories)} cal</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error updating meal display:', error);
        }
    }

    saveNutritionData() {
        localStorage.setItem('nutritionData', JSON.stringify(this.nutritionData));
    }

    generateInsights() {
        try {
            const todayData = this.getTodayData();
            const totals = this.calculateDayTotals(todayData);
            const insights = [];

            // Protein analysis
            if (totals.protein >= this.dailyGoals.protein * 0.9) {
                insights.push({
                    icon: '✅',
                    title: 'Great protein intake!',
                    description: "You're meeting your daily protein goals consistently."
                });
            } else if (totals.protein < this.dailyGoals.protein * 0.7) {
                insights.push({
                    icon: '⚠️',
                    title: 'Low protein intake',
                    description: 'Consider adding more lean meats, eggs, or protein powder.'
                });
            }

            // Fiber analysis (mock)
            if (Math.random() > 0.5) {
                insights.push({
                    icon: '⚠️',
                    title: 'Low fiber intake',
                    description: 'Consider adding more vegetables and whole grains.'
                });
            }

            // Hydration analysis
            if (this.currentWaterIntake >= this.dailyGoals.water * 0.8) {
                insights.push({
                    icon: '💧',
                    title: 'Excellent hydration!',
                    description: "You're staying well hydrated throughout the day."
                });
            }

            // Update insights display
            const insightsList = document.querySelector('.insight-list');
            if (insightsList) {
                insightsList.innerHTML = insights.map(insight => `
                    <div class="insight-item">
                        <span class="insight-icon">${this.sanitizeInput(insight.icon)}</span>
                        <div class="insight-content">
                            <h4>${this.sanitizeInput(insight.title)}</h4>
                            <p>${this.sanitizeInput(insight.description)}</p>
                        </div>
                    </div>
                `).join('');
            }

            this.generateMealSuggestions();
        } catch (error) {
            console.error('Error generating insights:', error);
        }
    }

    generateMealSuggestions() {
        try {
            const suggestions = [
                {
                    name: 'Mediterranean Bowl',
                    description: 'High protein, balanced macros',
                    calories: 520,
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&h=80&fit=crop&crop=center'
                },
                {
                    name: 'Protein Smoothie',
                    description: 'Post-workout recovery',
                    calories: 280,
                    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=80&h=80&fit=crop&crop=center'
                },
                {
                    name: 'Quinoa Salad',
                    description: 'Fiber-rich, nutrient dense',
                    calories: 380,
                    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=80&h=80&fit=crop&crop=center'
                }
            ];

            const suggestionsList = document.querySelector('.suggestion-list');
            if (suggestionsList) {
                suggestionsList.innerHTML = suggestions.map(suggestion => {
                    const safeName = this.sanitizeInput(suggestion.name).replace(/'/g, '&apos;');
                    return `
                        <div class="suggestion-item">
                            <img src="${this.sanitizeInput(suggestion.image)}" alt="${this.sanitizeInput(suggestion.name)}">
                            <div class="suggestion-content">
                                <h4>${this.sanitizeInput(suggestion.name)}</h4>
                                <p>${this.sanitizeInput(suggestion.description)}</p>
                                <span class="suggestion-calories">${suggestion.calories} cal</span>
                            </div>
                            <button class="add-suggestion-btn" onclick="addSuggestionToMeal('${safeName}', ${suggestion.calories})">Add</button>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error generating meal suggestions:', error);
        }
    }

    async searchFood(query) {
        try {
            const sanitizedQuery = this.sanitizeInput(query);
            
            // First search local database
            const localResults = this.foodDatabase.filter(food => 
                food.name.toLowerCase().includes(sanitizedQuery.toLowerCase())
            );
            
            // Then search Open Food Facts API with HTTPS
            try {
                const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(sanitizedQuery)}&json=1&page_size=10`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                
                const data = await response.json();
                
                const apiResults = data.products?.map(product => ({
                    name: this.sanitizeInput(product.product_name || 'Unknown Food'),
                    calories: Math.round((product.nutriments?.['energy-kcal_100g'] || 0)),
                    protein: Math.round((product.nutriments?.['proteins_100g'] || 0) * 10) / 10,
                    carbs: Math.round((product.nutriments?.['carbohydrates_100g'] || 0) * 10) / 10,
                    fat: Math.round((product.nutriments?.['fat_100g'] || 0) * 10) / 10,
                    per: '100g'
                })).filter(food => food.name !== 'Unknown Food' && food.calories > 0) || [];
                
                return [...localResults, ...apiResults];
            } catch (error) {
                console.error('API search failed:', error);
                return localResults;
            }
        } catch (error) {
            console.error('Food search error:', error);
            return [];
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

// Global functions for HTML onclick handlers
function openFoodSearch() {
    const modal = document.getElementById('foodSearchModal');
    if (modal) {
        modal.classList.remove('hidden');
        const searchInput = document.getElementById('foodSearchInput');
        searchInput.focus();
        
        // Add Enter key support
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchFood();
            }
        });
        
        // Clear previous results
        document.getElementById('searchResults').innerHTML = '';
    }
}

function closeFoodSearch() {
    const modal = document.getElementById('foodSearchModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function searchFood() {
    try {
        const query = document.getElementById('foodSearchInput').value.trim();
        const resultsContainer = document.getElementById('searchResults');
        
        if (!query) {
            resultsContainer.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Enter a food name to search</p>';
            return;
        }
        
        // Show loading
        resultsContainer.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Searching...</p>';
        
        const results = await nutritionTracker.searchFood(query);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">No foods found. Try a different search term.</p>';
            return;
        }
        
        resultsContainer.innerHTML = results.map(food => {
            const safeName = nutritionTracker.sanitizeInput(food.name).replace(/'/g, '&apos;');
            return `
                <div class="search-result-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border); background: var(--glass); margin-bottom: 0.5rem; border-radius: 8px;">
                    <div>
                        <h4 style="color: var(--text); margin-bottom: 0.25rem; font-weight: 600;">${nutritionTracker.sanitizeInput(food.name)}</h4>
                        <p style="color: var(--muted); font-size: 0.9rem;">${food.calories} cal, ${food.protein}g protein per ${food.per}</p>
                    </div>
                    <button onclick="addFoodFromSearch('${safeName}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat})" 
                            style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;" 
                            onmouseover="this.style.transform='translateY(-1px)'" 
                            onmouseout="this.style.transform='translateY(0)'">
                        Add
                    </button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Search error:', error);
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Search failed. Please try again.</p>';
        }
    }
}

function addFoodFromSearch(name, calories, protein, carbs, fat) {
    const food = { name, calories, protein, carbs, fat };
    const mealType = window.currentMealType || 'breakfast';
    
    nutritionTracker.addFoodToMeal(mealType, food);
    closeFoodSearch();
    
    const mealNames = {
        breakfast: 'breakfast',
        lunch: 'lunch', 
        dinner: 'dinner',
        snacks: 'snacks'
    };
    
    if (typeof auth !== 'undefined' && auth.showToast) {
        auth.showToast(`Added ${name} to ${mealNames[mealType]}!`, 'success');
    }
}

function addFoodToMeal(mealType) {
    openFoodSearch();
    // Store current meal type for adding food
    window.currentMealType = mealType;
}

function scanBarcode() {
    // Simulate barcode scanning
    const mockFoods = [
        { name: 'Protein Bar', calories: 200, protein: 20, carbs: 15, fat: 8 },
        { name: 'Energy Drink', calories: 110, protein: 0, carbs: 28, fat: 0 },
        { name: 'Greek Yogurt Cup', calories: 150, protein: 15, carbs: 12, fat: 6 }
    ];
    
    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
    
    if (typeof auth !== 'undefined' && auth.showToast) {
        auth.showToast(`Scanned: ${randomFood.name}`, 'success');
    }
    
    // Add to snacks for demo
    nutritionTracker.addFoodToMeal('snacks', randomFood);
}

function addCustomFood() {
    try {
        const name = prompt('Enter food name:');
        if (!name || name.trim().length === 0) return;
        
        const calories = parseInt(prompt('Enter calories per serving:') || '0');
        const protein = parseInt(prompt('Enter protein (g):') || '0');
        const carbs = parseInt(prompt('Enter carbs (g):') || '0');
        const fat = parseInt(prompt('Enter fat (g):') || '0');
        
        // Validate inputs
        if (isNaN(calories) || calories < 0 || calories > 10000) {
            if (typeof auth !== 'undefined' && auth.showToast) {
                auth.showToast('Invalid calories value', 'error');
            }
            return;
        }
        
        const customFood = { 
            name: nutritionTracker.sanitizeInput(name.trim()), 
            calories: Math.max(0, calories), 
            protein: Math.max(0, protein || 0), 
            carbs: Math.max(0, carbs || 0), 
            fat: Math.max(0, fat || 0) 
        };
        
        nutritionTracker.addFoodToMeal('snacks', customFood);
        
        if (typeof auth !== 'undefined' && auth.showToast) {
            auth.showToast(`Added custom food: ${customFood.name}`, 'success');
        }
    } catch (error) {
        console.error('Add custom food error:', error);
        if (typeof auth !== 'undefined' && auth.showToast) {
            auth.showToast('Failed to add custom food', 'error');
        }
    }
}

function addSuggestionToMeal(name, calories) {
    const food = { name, calories, protein: 25, carbs: 45, fat: 15 }; // Mock values
    nutritionTracker.addFoodToMeal('lunch', food);
    
    if (typeof auth !== 'undefined' && auth.showToast) {
        auth.showToast(`Added ${name} to lunch!`, 'success');
    }
}

function addWater(amount) {
    nutritionTracker.addWater(amount);
}

// Initialize nutrition tracker
let nutritionTracker;
document.addEventListener('DOMContentLoaded', () => {
    nutritionTracker = new NutritionTracker();
});