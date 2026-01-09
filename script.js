// Thatix Food Discovery Website - Fixed JavaScript

// DOM Elements
const foodGridMainContainerElement = document.getElementById('foodGridMainContainer');
const searchInputFieldElement = document.getElementById('searchInputField');
const searchSubmitButtonElement = document.getElementById('searchSubmitButton');
const loadingWrapperElement = document.getElementById('loadingWrapper');
const foodDetailModalElement = document.getElementById('foodDetailModal');
const modalBodyContentDisplayElement = document.getElementById('modalBodyContentDisplay');
const suggestionButtonItemElements = document.querySelectorAll('.suggestion-button-item');
const categoryExploreButtonElements = document.querySelectorAll('.category-explore-button');

// API Configuration
const apiBaseUrlMain = 'https://www.themealdb.com/api/json/v1/1';
const apiSearchUrlMain = `${apiBaseUrlMain}/search.php?s=`;
const apiLookupUrlMain = `${apiBaseUrlMain}/lookup.php?i=`;

// Initial foods to display
const initialFoodItemsArray = [
    {id: '52772', name: 'Teriyaki Chicken'},
    {id: '52773', name: 'Beef Wellington'},
    {id: '52774', name: 'Pasta Carbonara'},
    {id: '52775', name: 'Vegetable Curry'},
    {id: '52776', name: 'Fish Tacos'},
    {id: '52777', name: 'Chocolate Cake'},
    {id: '52778', name: 'Greek Salad'},
    {id: '52779', name: 'Mushroom Risotto'},
    {id: '52780', name: 'BBQ Ribs'},
    {id: '52781', name: 'Shrimp Scampi'},
    {id: '52782', name: 'French Onion Soup'},
    {id: '52783', name: 'Cheeseburger'},
    {id: '52784', name: 'Vegetable Stir Fry'},
    {id: '52785', name: 'Apple Pie'},
    {id: '52786', name: 'Chicken Alfredo'},
    {id: '52787', name: 'Beef Stroganoff'},
    {id: '52788', name: 'Caesar Salad'},
    {id: '52789', name: 'Eggplant Parmesan'},
    {id: '52790', name: 'Lemon Chicken'},
    {id: '52791', name: 'Tiramisu'},
    {id: '52792', name: 'Pad Thai'}
];

// Global variables
let currentFoodDataArray = [];
let foodModalInstance = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal
    foodModalInstance = new bootstrap.Modal(foodDetailModalElement);
    
    // Load initial foods
    loadInitialFoodItems();
    
    // Setup event listeners
    setupAllEventListenersNow();
});

// Setup event listeners
function setupAllEventListenersNow() {
    // Search button
    searchSubmitButtonElement.addEventListener('click', executeFoodSearchNow);
    
    // Enter key
    searchInputFieldElement.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            executeFoodSearchNow();
        }
    });
    
    // Suggestion buttons
    suggestionButtonItemElements.forEach(button => {
        button.addEventListener('click', function() {
            const foodQuery = this.getAttribute('data-food-name');
            searchInputFieldElement.value = foodQuery;
            executeFoodSearchNow();
        });
    });
    
    // Category buttons
    categoryExploreButtonElements.forEach(button => {
        button.addEventListener('click', function() {
            const categoryName = this.getAttribute('data-category-name');
            searchByCategoryNow(categoryName);
        });
    });
    
    // Modal close
    foodDetailModalElement.addEventListener('hidden.bs.modal', function() {
        modalBodyContentDisplayElement.innerHTML = '';
    });
}

// Load initial food items (21 boxes)
async function loadInitialFoodItems() {
    showLoadingIndicatorNow();
    
    try {
        // Use predefined meal IDs to ensure we get 21 items
        const mealPromises = initialFoodItemsArray.map(item => 
            fetch(`${apiLookupUrlMain}${item.id}`).then(response => response.json())
        );
        
        // Process in batches to avoid too many requests at once
        const batchSize = 5;
        const resultsArray = [];
        
        for (let i = 0; i < mealPromises.length; i += batchSize) {
            const batch = mealPromises.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(batch);
            
            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value.meals) {
                    resultsArray.push(result.value.meals[0]);
                }
            });
            
            // Small delay between batches
            if (i + batchSize < mealPromises.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        currentFoodDataArray = resultsArray.slice(0, 21);
        
        // If we don't have enough meals, fill with fallback data
        if (currentFoodDataArray.length < 21) {
            await addFallbackFoodItems();
        }
        
        displayFoodItemsInGridNow(currentFoodDataArray);
    } catch (error) {
        console.error('Error loading food items:', error);
        displayErrorInGridNow('Failed to load food items. Please try again.');
        // Load fallback data
        await loadFallbackData();
    } finally {
        hideLoadingIndicatorNow();
    }
}

// Add fallback food items
async function addFallbackFoodItems() {
    try {
        // Search for common foods to fill remaining slots
        const commonFoods = ['chicken', 'beef', 'pasta', 'rice', 'cake'];
        
        for (const food of commonFoods) {
            if (currentFoodDataArray.length >= 21) break;
            
            const response = await fetch(`${apiSearchUrlMain}${food}`);
            const data = await response.json();
            
            if (data.meals) {
                data.meals.forEach(meal => {
                    if (currentFoodDataArray.length < 21 && 
                        !currentFoodDataArray.some(item => item.idMeal === meal.idMeal)) {
                        currentFoodDataArray.push(meal);
                    }
                });
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    } catch (error) {
        console.error('Error adding fallback items:', error);
    }
}

// Load fallback data if API fails
async function loadFallbackData() {
    // Fallback hardcoded data
    const fallbackFoods = [
        {
            idMeal: '1',
            strMeal: 'Chicken Curry',
            strCategory: 'Chicken',
            strArea: 'Indian',
            strMealThumb: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            strInstructions: 'A delicious chicken curry with spices and herbs.'
        },
        {
            idMeal: '2',
            strMeal: 'Beef Burger',
            strCategory: 'Beef',
            strArea: 'American',
            strMealThumb: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            strInstructions: 'Classic beef burger with cheese and vegetables.'
        },
        {
            idMeal: '3',
            strMeal: 'Vegetable Pasta',
            strCategory: 'Vegetarian',
            strArea: 'Italian',
            strMealThumb: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            strInstructions: 'Pasta with fresh vegetables and tomato sauce.'
        },
        {
            idMeal: '4',
            strMeal: 'Chocolate Cake',
            strCategory: 'Dessert',
            strArea: 'International',
            strMealThumb: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            strInstructions: 'Rich chocolate cake with creamy frosting.'
        }
    ];
    
    // Create 21 boxes with fallback data
    const allFoods = [];
    for (let i = 0; i < 21; i++) {
        const food = {...fallbackFoods[i % fallbackFoods.length]};
        food.idMeal = String(i + 1);
        food.strMeal = `${food.strMeal} ${Math.floor(i / 4) + 1}`;
        allFoods.push(food);
    }
    
    currentFoodDataArray = allFoods;
    displayFoodItemsInGridNow(currentFoodDataArray);
}

// Execute food search
async function executeFoodSearchNow() {
    const searchTermValue = searchInputFieldElement.value.trim();
    
    if (!searchTermValue) {
        alert('Please enter a food name to search.');
        return;
    }
    
    showLoadingIndicatorNow();
    
    try {
        const apiResponse = await fetch(`${apiSearchUrlMain}${searchTermValue}`);
        const responseData = await apiResponse.json();
        
        if (responseData.meals) {
            currentFoodDataArray = responseData.meals.slice(0, 21);
            displayFoodItemsInGridNow(currentFoodDataArray);
        } else {
            showNoResultsMessageNow(searchTermValue);
        }
    } catch (error) {
        console.error('Error searching food items:', error);
        displayErrorInGridNow('Failed to search food items. Please check your connection.');
    } finally {
        hideLoadingIndicatorNow();
    }
}

// Search by category
async function searchByCategoryNow(category) {
    searchInputFieldElement.value = category;
    executeFoodSearchNow();
}

// Display food items in grid
function displayFoodItemsInGridNow(foodItems) {
    // Clear grid
    foodGridMainContainerElement.innerHTML = '';
    
    if (!foodItems || foodItems.length === 0) {
        foodGridMainContainerElement.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info p-4">
                    <h4>No food items found</h4>
                    <p>Try searching for something else.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Create boxes
    foodItems.forEach((foodItem, index) => {
        const foodBoxElement = createFoodBoxElementNow(foodItem, index);
        foodGridMainContainerElement.appendChild(foodBoxElement);
    });
}

// Create food box element
function createFoodBoxElementNow(foodItem, indexNumber) {
    // Create column
    const columnElement = document.createElement('div');
    columnElement.className = 'col-lg-3 col-md-4 col-sm-6';
    
    // Get category
    const foodCategoryValue = foodItem.strCategory || 'General';
    
    // Create short description (5 words)
    const shortDescriptionText = foodItem.strInstructions 
        ? foodItem.strInstructions.split(' ').slice(0, 5).join(' ') + '...' 
        : 'Delicious food item with great taste.';
    
    // Create box
    columnElement.innerHTML = `
        <div class="food-item-container">
            <img src="${foodItem.strMealThumb || 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" 
                 alt="${foodItem.strMeal}" 
                 class="food-image-display">
            <div class="food-content-container">
                <h3 class="food-name-header">${foodItem.strMeal || 'Food Item'}</h3>
                <span class="food-category-tag">${foodCategoryValue}</span>
                <p class="food-description-short">${shortDescriptionText}</p>
                <button class="food-view-button view-details-action-button" data-meal-id-value="${foodItem.idMeal}">
                    <i class="fas fa-info-circle me-2"></i>View Details
                </button>
            </div>
        </div>
    `;
    
    // Add event listener
    const viewDetailsButton = columnElement.querySelector('.view-details-action-button');
    viewDetailsButton.addEventListener('click', function() {
        const mealIdValue = this.getAttribute('data-meal-id-value');
        showFoodItemDetailsNow(mealIdValue);
    });
    
    return columnElement;
}

// Show food item details
async function showFoodItemDetailsNow(mealId) {
    showLoadingIndicatorNow();
    
    try {
        const apiResponse = await fetch(`${apiLookupUrlMain}${mealId}`);
        const responseData = await apiResponse.json();
        
        if (responseData.meals && responseData.meals.length > 0) {
            const mealDetails = responseData.meals[0];
            displayFoodDetailsInModalNow(mealDetails);
        } else {
            // Try to find in current data
            const localMeal = currentFoodDataArray.find(item => item.idMeal === mealId);
            if (localMeal) {
                displayFoodDetailsInModalNow(localMeal);
            } else {
                alert('Food details not found.');
            }
        }
    } catch (error) {
        console.error('Error fetching food details:', error);
        // Try to find in current data
        const localMeal = currentFoodDataArray.find(item => item.idMeal === mealId);
        if (localMeal) {
            displayFoodDetailsInModalNow(localMeal);
        } else {
            alert('Failed to load food details. Please try again.');
        }
    } finally {
        hideLoadingIndicatorNow();
    }
}

// Display food details in modal
function displayFoodDetailsInModalNow(mealDetails) {
    // Prepare ingredients
    let ingredientsHtmlContent = '';
    for (let i = 1; i <= 20; i++) {
        const ingredientItem = mealDetails[`strIngredient${i}`];
        const measureItem = mealDetails[`strMeasure${i}`];
        
        if (ingredientItem && ingredientItem.trim() !== '') {
            ingredientsHtmlContent += `<li>${measureItem || ''} ${ingredientItem}</li>`;
        }
    }
    
    if (!ingredientsHtmlContent) {
        ingredientsHtmlContent = '<li>Ingredients not available</li>';
    }
    
    // Create modal content
    modalBodyContentDisplayElement.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${mealDetails.strMealThumb || 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" 
                     alt="${mealDetails.strMeal}" 
                     class="food-detail-image-display">
                <h3 class="food-detail-name-header">${mealDetails.strMeal || 'Food Item'}</h3>
                <span class="food-detail-category-tag">${mealDetails.strCategory || 'General'}</span>
                <p><strong>Origin:</strong> ${mealDetails.strArea || 'International'}</p>
            </div>
            <div class="col-md-6">
                <h4>Ingredients</h4>
                <ul class="ingredient-list-display">
                    ${ingredientsHtmlContent}
                </ul>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-12">
                <h4>Instructions</h4>
                <p class="food-detail-instruction-text">${mealDetails.strInstructions || 'No instructions available.'}</p>
            </div>
        </div>
        ${mealDetails.strYoutube ? `
        <div class="row mt-3">
            <div class="col-12">
                <h4>Video Guide</h4>
                <p><a href="${mealDetails.strYoutube}" target="_blank" class="btn btn-danger">
                    <i class="fab fa-youtube me-2"></i>Watch Video
                </a></p>
            </div>
        </div>
        ` : ''}
    `;
    
    // Show modal
    foodModalInstance.show();
}

// Show no results message
function showNoResultsMessageNow(searchTerm) {
    foodGridMainContainerElement.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-warning p-4">
                <h4>No results for "${searchTerm}"</h4>
                <p>Try searching for: pizza, burger, pasta, cake</p>
            </div>
        </div>
    `;
}

// Display error in grid
function displayErrorInGridNow(errorMessage) {
    foodGridMainContainerElement.innerHTML = `
        <div class="col-12 text-center">
            <div class="alert alert-danger p-4">
                <h4>Error</h4>
                <p>${errorMessage}</p>
                <button class="btn btn-primary mt-3" onclick="loadFallbackData()">Load Sample Data</button>
            </div>
        </div>
    `;
}

// Show loading indicator
function showLoadingIndicatorNow() {
    loadingWrapperElement.style.display = 'block';
}

// Hide loading indicator
function hideLoadingIndicatorNow() {
    loadingWrapperElement.style.display = 'none';
}