/**
 * NutriPlan - Main Entry Point
 * 
 * This is the main entry point for the application.
 * Import your modules and initialize the app here.
 */

'use strict';

// ------li selector------
const sectionsBtns = document.querySelectorAll('.space-y-1 li');
const navLink = document.querySelectorAll('.nav-link');

// -----first section-----
const searchFiltersSection = document.querySelector('#search-filters-section');
const mealCategoriesSection = document.querySelector('#meal-categories-section');
const allRecipesSection = document.querySelector('#all-recipes-section');
const mealDetails = document.querySelector('#meal-details');
const recipesCount = document.querySelector('#recipes-count');
const recipesGrid = document.querySelector('#recipes-grid');
const backToMealsBtn = document.querySelector('#back-to-meals-btn');
const productsGrid = document.querySelector('#products-grid');
const logMealBtn = document.querySelector('#log-meal-btn');

// ----second section-----
const productsSection = document.querySelector('#products-section');
const productSearchInput = document.querySelector('#product-search-input');
const searchProductBtn = document.querySelector('#search-product-btn');
const barcodeInput = document.querySelector('#barcode-input');
const lookupBarcodeBtn = document.querySelector('#lookup-barcode-btn');

// ----third section------
const foodlogSection = document.querySelector('#foodlog-section');
const firstQuck = document.querySelector('.firstQuck');
const secondQuck = document.querySelector('.secondQuck');
const thirdQuck = document.querySelector('.thirdQuck');

//--- search input & API----
const searchInput = document.querySelector('#search-input');


// ✅ State
let currentResults = [];
let currentProductResults = [];
let currentMeal = null; // ✅ بنحفظ الـ meal الحالية عشان logMealBtn يقرأ منها
let debounceTimer = null;


// ---- hide & unhide-----

const active = ['bg-emerald-50', 'text-emerald-700']
const unActive = ['text-gray-600', 'hover:bg-gray-50']

sectionsBtns[0].addEventListener('click', () => {
    navLink[0].classList.remove(...unActive);
    navLink[0].classList.add(...active);
    navLink[1].classList.remove(...active);
    navLink[1].classList.add(...unActive);
    navLink[2].classList.remove(...active);
    navLink[2].classList.add(...unActive);

    searchFiltersSection.classList.remove('hidden');
    mealCategoriesSection.classList.remove('hidden');
    allRecipesSection.classList.remove('hidden');
    productsSection.classList.add('hidden');
    foodlogSection.classList.add('hidden');
})

sectionsBtns[1].addEventListener('click', () => {
    navLink[1].classList.remove(...unActive);
    navLink[1].classList.add(...active);
    navLink[0].classList.remove(...active);
    navLink[0].classList.add(...unActive);
    navLink[2].classList.remove(...active);
    navLink[2].classList.add(...unActive);

    searchFiltersSection.classList.add('hidden');
    mealCategoriesSection.classList.add('hidden');
    allRecipesSection.classList.add('hidden');
    productsSection.classList.remove('hidden');
    foodlogSection.classList.add('hidden');
})

sectionsBtns[2].addEventListener('click', () => {
    navLink[2].classList.remove(...unActive);
    navLink[2].classList.add(...active);
    navLink[0].classList.remove(...active);
    navLink[0].classList.add(...unActive);
    navLink[1].classList.remove(...active);
    navLink[1].classList.add(...unActive);

    searchFiltersSection.classList.add('hidden');
    mealCategoriesSection.classList.add('hidden');
    allRecipesSection.classList.add('hidden');
    productsSection.classList.add('hidden');
    foodlogSection.classList.remove('hidden');
})


// ✅ دالة واحدة مشتركة لعرض كروت الـ meals
function renderCards(results) {
    if (!results || results.length === 0) {
        recipesCount.innerHTML = `Showing 0 recipes`;
        recipesGrid.innerHTML = `<p class="text-gray-500 text-center py-8 col-span-full">No recipes found</p>`;
        return;
    }

    recipesCount.innerHTML = `Showing ${results.length} recipes`;

    recipesGrid.innerHTML = results.map(meal => `
        <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
             data-meal-id="${meal.id}">
            <div class="relative h-48 overflow-hidden">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                     src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
                <div class="absolute bottom-3 left-3 flex gap-2">
                    <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category}</span>
                    <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.area}</span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">${meal.instructions || ''}</p>
                <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i> ${meal.category}</span>
                    <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i> ${meal.area}</span>
                </div>
            </div>
        </div>
    `).join('');
}


// ✅ دالة واحدة مشتركة لعرض كروت الـ products
function renderProductCards(results) {
    if (!results || results.length === 0) {
        productsGrid.innerHTML = `<p class="text-gray-500 text-center py-8 col-span-full">No products found</p>`;
        return;
    }

    productsGrid.innerHTML = results.map(product => `
        <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
             data-barcode="${product.barcode}">
            <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product.image ?? ''}"
                    alt="${product.name ?? 'Product'}"
                    loading="lazy"
                />
                <div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                    Nutri-Score ${product.nutritionGrade?.toUpperCase() ?? '?'}
                </div>
                <div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    ${product.novaGroup ?? '?'}
                </div>
            </div>
            <div class="p-4">
                <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand ?? ''}</p>
                <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    ${product.name ?? ''}
                </h3>
                <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span><i class="fa-solid fa-fire mr-1"></i>${product.nutrients?.calories ?? '?'} kcal/100g</span>
                </div>
                <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                        <p class="text-xs font-bold text-emerald-700">${product.nutrients?.protein ?? '?'}g</p>
                        <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                        <p class="text-xs font-bold text-blue-700">${product.nutrients?.carbs ?? '?'}g</p>
                        <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                        <p class="text-xs font-bold text-purple-700">${product.nutrients?.fat ?? '?'}g</p>
                        <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                        <p class="text-xs font-bold text-orange-700">${product.nutrients?.sugar ?? '?'}g</p>
                        <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}


// ✅ دالة الـ product modal
function showProductModal(p) {
    const nutriColors = { a: '#1a9850', b: '#91cf60', c: '#fecb02', d: '#fc8d59', e: '#d73027' };
    const nutriColor = nutriColors[p.nutritionGrade?.toLowerCase()] ?? '#999';

    const novaColors = { 1: '#1a9850', 2: '#91cf60', 3: '#fc8d59', 4: '#e63e11' };
    const novaColor = novaColors[p.novaGroup] ?? '#999';

    const protPct = Math.min((p.nutrients.protein / 50) * 100, 100).toFixed(0);
    const carbPct = Math.min((p.nutrients.carbs / 300) * 100, 100).toFixed(0);
    const fatPct = Math.min((p.nutrients.fat / 65) * 100, 100).toFixed(0);
    const sugarPct = Math.min((p.nutrients.sugar / 50) * 100, 100).toFixed(0);

    const modalEl = document.createElement('div');
    modalEl.id = 'product-detail-modal';
    modalEl.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modalEl.innerHTML = `
        <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex items-start gap-6 mb-6">
                    <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src="${p.image ?? ''}" alt="${p.name ?? ''}" class="w-full h-full object-contain">
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-emerald-600 font-semibold mb-1">${p.brand ?? ''}</p>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">${p.name ?? ''}</h2>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${nutriColor}20">
                                <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${nutriColor}">
                                    ${p.nutritionGrade?.toUpperCase() ?? '?'}
                                </span>
                                <p class="text-xs font-bold" style="color: ${nutriColor}">Nutri-Score</p>
                            </div>
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${novaColor}20">
                                <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${novaColor}">
                                    ${p.novaGroup ?? '?'}
                                </span>
                                <p class="text-xs font-bold" style="color: ${novaColor}">NOVA</p>
                            </div>
                        </div>
                    </div>
                    <button class="close-modal text-gray-400 hover:text-gray-600 text-2xl">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
                    <h3 class="font-bold text-gray-900 mb-4">
                        <i class="fa-solid fa-chart-pie text-emerald-600 mr-2"></i>
                        Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
                    </h3>
                    <div class="text-center mb-4 pb-4 border-b border-emerald-200">
                        <p class="text-4xl font-bold text-gray-900">${p.nutrients.calories}</p>
                        <p class="text-sm text-gray-500">Calories</p>
                    </div>
                    <div class="grid grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-emerald-500 h-2 rounded-full" style="width: ${protPct}%"></div>
                            </div>
                            <p class="text-lg font-bold text-emerald-600">${p.nutrients.protein}g</p>
                            <p class="text-xs text-gray-500">Protein</p>
                        </div>
                        <div class="text-center">
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${carbPct}%"></div>
                            </div>
                            <p class="text-lg font-bold text-blue-600">${p.nutrients.carbs}g</p>
                            <p class="text-xs text-gray-500">Carbs</p>
                        </div>
                        <div class="text-center">
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPct}%"></div>
                            </div>
                            <p class="text-lg font-bold text-purple-600">${p.nutrients.fat}g</p>
                            <p class="text-xs text-gray-500">Fat</p>
                        </div>
                        <div class="text-center">
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-orange-500 h-2 rounded-full" style="width: ${sugarPct}%"></div>
                            </div>
                            <p class="text-lg font-bold text-orange-600">${p.nutrients.sugar}g</p>
                            <p class="text-xs text-gray-500">Sugar</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
                        <div class="text-center">
                            <p class="text-sm font-semibold text-gray-900">${p.nutrients.saturatedFat ?? '?'}g</p>
                            <p class="text-xs text-gray-500">Saturated Fat</p>
                        </div>
                        <div class="text-center">
                            <p class="text-sm font-semibold text-gray-900">${p.nutrients.fiber ?? '?'}g</p>
                            <p class="text-xs text-gray-500">Fiber</p>
                        </div>
                        <div class="text-center">
                            <p class="text-sm font-semibold text-gray-900">${p.nutrients.sodium ?? '?'}g</p>
                            <p class="text-xs text-gray-500">Sodium</p>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
                        <i class="fa-solid fa-plus mr-2"></i>Log This Food
                    </button>
                    <button class="close-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modalEl);

    modalEl.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => modalEl.remove());
    });
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modalEl.remove();
    });
}


// ✅ دالة الـ meal log modal — بتاخد الـ meal والـ nutrition كـ parameters
function showMealLog(meal, nutrition) {
    const baseCalories = nutrition?.cal ?? 0;
    const baseProtein  = nutrition?.prot ?? 0;
    const baseCarbs    = nutrition?.carb ?? 0;
    const baseFat      = nutrition?.fa ?? 0;

    const modalEl = document.createElement('div');
    modalEl.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modalEl.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div class="flex items-center gap-4 mb-6">
                <img src="${meal?.thumbnail ?? ''}" alt="${meal?.name ?? ''}" class="w-16 h-16 rounded-xl object-cover">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
                    <p class="text-gray-500 text-sm">${meal?.name ?? ''}</p>
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
                <div class="flex items-center gap-3">
                    <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                        <i class="fa-solid fa-minus text-gray-600"></i>
                    </button>
                    <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5"
                           class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2">
                    <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                        <i class="fa-solid fa-plus text-gray-600"></i>
                    </button>
                </div>
            </div>

            <div class="bg-emerald-50 rounded-xl p-4 mb-6">
                <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
                <div class="grid grid-cols-4 gap-2 text-center">
                    <div>
                        <p class="text-lg font-bold text-emerald-600" id="modal-calories">${baseCalories}</p>
                        <p class="text-xs text-gray-500">Calories</p>
                    </div>
                    <div>
                        <p class="text-lg font-bold text-blue-600" id="modal-protein">${baseProtein}g</p>
                        <p class="text-xs text-gray-500">Protein</p>
                    </div>
                    <div>
                        <p class="text-lg font-bold text-amber-600" id="modal-carbs">${baseCarbs}g</p>
                        <p class="text-xs text-gray-500">Carbs</p>
                    </div>
                    <div>
                        <p class="text-lg font-bold text-purple-600" id="modal-fat">${baseFat}g</p>
                        <p class="text-xs text-gray-500">Fat</p>
                    </div>
                </div>
            </div>

            <div class="flex gap-3">
                <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                    Cancel
                </button>
                <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                    <i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalEl);

    // ✅ أزرار + و -
    const servingsInput = modalEl.querySelector('#meal-servings');
    const calEl   = modalEl.querySelector('#modal-calories');
    const protEl  = modalEl.querySelector('#modal-protein');
    const carbEl  = modalEl.querySelector('#modal-carbs');
    const fatEl   = modalEl.querySelector('#modal-fat');

    function updateNutrition() {
        const s = parseFloat(servingsInput.value) || 1;
        calEl.textContent  = Math.round(baseCalories * s);
        protEl.textContent = Math.round(baseProtein  * s) + 'g';
        carbEl.textContent = Math.round(baseCarbs    * s) + 'g';
        fatEl.textContent  = Math.round(baseFat      * s) + 'g';
    }

    modalEl.querySelector('#increase-servings').addEventListener('click', () => {
        const current = parseFloat(servingsInput.value) || 1;
        if (current < 10) {
            servingsInput.value = (current + 0.5).toFixed(1);
            updateNutrition();
        }
    });

    modalEl.querySelector('#decrease-servings').addEventListener('click', () => {
        const current = parseFloat(servingsInput.value) || 1;
        if (current > 0.5) {
            servingsInput.value = (current - 0.5).toFixed(1);
            updateNutrition();
        }
    });

    servingsInput.addEventListener('input', updateNutrition);

    // ✅ إغلاق الـ modal
    modalEl.querySelector('#cancel-log-meal').addEventListener('click', () => modalEl.remove());
    modalEl.querySelector('#confirm-log-meal').addEventListener('click', () => {
        const servings = parseFloat(servingsInput.value) || 1;
        console.log('Logged:', meal?.name, '| Servings:', servings);
        // هنا هتضيف الـ food log logic لاحقاً
        modalEl.remove();
    });

    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modalEl.remove();
    });
}


// ✅ دالة استخراج YouTube ID
function getYoutubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
}


// ✅ تحليل التغذية
async function analyzeMeals(ingredients) {
    try {
        const req = await fetch('https://nutriplan-api.vercel.app/api/nutrition/analyze', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': 'dFRDOqT8haVcKflWj0QkXAjgTLhc8oEQo5mug5YH'
            },
            body: JSON.stringify({
                ingredients: ingredients.map(ing => `${ing.measure} ${ing.ingredient}`)
            })
        });

        const analyzedData = await req.json();

        const servings = analyzedData.data.servings;
        const t = analyzedData.data.totals;

        const cal    = Math.round(t.calories     / servings);
        const prot   = Math.round(t.protein      / servings);
        const fa     = Math.round(t.fat          / servings);
        const carb   = Math.round(t.carbs        / servings);
        const fib    = Math.round(t.fiber        / servings);
        const sug    = Math.round(t.sugar        / servings);
        const satFat = Math.round(t.saturatedFat / servings);
        const chol   = Math.round(t.cholesterol  / servings);
        const sod    = Math.round(t.sodium       / servings);

        // ✅ بنحفظ الـ nutrition في currentMeal عشان showMealLog يقرأ منها
        if (currentMeal) {
            currentMeal.nutrition = { cal, prot, fa, carb, fib, sug, satFat, chol, sod };
        }

        const proteinPct      = Math.min((prot   / 50)   * 100, 100).toFixed(0);
        const carbsPct        = Math.min((carb   / 300)  * 100, 100).toFixed(0);
        const fatPct          = Math.min((fa     / 65)   * 100, 100).toFixed(0);
        const fiberPct        = Math.min((fib    / 28)   * 100, 100).toFixed(0);
        const sugarPct        = Math.min((sug    / 50)   * 100, 100).toFixed(0);
        const saturatedFatPct = Math.min((satFat / 20)   * 100, 100).toFixed(0);
        const cholesterolPct  = Math.min((chol   / 300)  * 100, 100).toFixed(0);
        const sodiumPct       = Math.min((sod    / 2300) * 100, 100).toFixed(0);

        const nutFac = document.querySelector('#nutrition-facts-container');
        nutFac.innerHTML = `
            <p class="text-sm text-gray-500 mb-4">Per serving</p>
            <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Calories per serving</p>
                <p class="text-4xl font-bold text-emerald-600">${cal}</p>
                <p class="text-xs text-gray-500 mt-1">Total: ${t.calories} cal</p>
            </div>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-emerald-500"></div><span class="text-gray-700">Protein</span></div>
                    <span class="font-bold text-gray-900">${prot}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-emerald-500 h-2 rounded-full" style="width: ${proteinPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-gray-700">Carbs</span></div>
                    <span class="font-bold text-gray-900">${carb}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full" style="width: ${carbsPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span class="text-gray-700">Fat</span></div>
                    <span class="font-bold text-gray-900">${fa}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-purple-500 h-2 rounded-full" style="width: ${fatPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-orange-500"></div><span class="text-gray-700">Fiber</span></div>
                    <span class="font-bold text-gray-900">${fib}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-orange-500 h-2 rounded-full" style="width: ${fiberPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-pink-500"></div><span class="text-gray-700">Sugar</span></div>
                    <span class="font-bold text-gray-900">${sug}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-pink-500 h-2 rounded-full" style="width: ${sugarPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-red-400"></div><span class="text-gray-700">Saturated Fat</span></div>
                    <span class="font-bold text-gray-900">${satFat}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-red-400 h-2 rounded-full" style="width: ${saturatedFatPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-yellow-500"></div><span class="text-gray-700">Cholesterol</span></div>
                    <span class="font-bold text-gray-900">${chol}mg</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-yellow-500 h-2 rounded-full" style="width: ${cholesterolPct}%"></div></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-gray-400"></div><span class="text-gray-700">Sodium</span></div>
                    <span class="font-bold text-gray-900">${sod}mg</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-gray-400 h-2 rounded-full" style="width: ${sodiumPct}%"></div></div>
            </div>
        `;

    } catch (err) {
        console.log('analyze error', err);
    }
}


// ✅ Click listener للـ meals
recipesGrid.addEventListener('click', (e) => {
    const clickedCard = e.target.closest('.recipe-card');
    if (!clickedCard) return;

    const cardId = clickedCard.dataset.mealId;
    const selectedMeal = currentResults.find(m => String(m.id) === String(cardId));
    if (!selectedMeal) return;

    // ✅ بنحفظ الـ meal الحالية عشان logMealBtn يقرأ منها
    currentMeal = selectedMeal;

    mealDetails.classList.remove('hidden');
    allRecipesSection.classList.add('hidden');
    mealCategoriesSection.classList.add('hidden');
    searchFiltersSection.classList.add('hidden');

    const detailImg      = document.querySelector('#meal-details img');
    const detailTitle    = document.querySelector('#meal-details h1');
    const detailCategory = document.querySelector('#meal-details .bg-emerald-500');
    const detailArea     = document.querySelector('#meal-details .bg-blue-500');
    const detailIngNum   = document.querySelector('h2 .text-gray-500');
    const ing            = document.querySelector('#newCartona');

    if (detailImg)      detailImg.src              = selectedMeal.thumbnail;
    if (detailTitle)    detailTitle.textContent     = selectedMeal.name;
    if (detailCategory) detailCategory.textContent  = selectedMeal.category;
    if (detailArea)     detailArea.textContent      = selectedMeal.area;
    if (detailIngNum)   detailIngNum.textContent    = selectedMeal.ingredients.length + ' items';

    let newCartona = '';
    for (let i = 0; i < selectedMeal.ingredients.length; i++) {
        newCartona += `<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                    <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
                    <span class="text-gray-700">
                        <span class="font-medium text-gray-900">${selectedMeal.ingredients[i].measure}</span> ${selectedMeal.ingredients[i].ingredient}
                    </span>
                </div>`;
    }
    if (ing) ing.innerHTML = newCartona;

    let newCartonaInst = '';
    for (let i = 0; i < selectedMeal.instructions.length; i++) {
        newCartonaInst += `<div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                        ${i + 1}
                    </div>
                    <p class="text-gray-700 leading-relaxed pt-2">${selectedMeal.instructions[i]}</p>
                </div>`;
    }
    document.querySelector('.space-y-4').innerHTML = newCartonaInst;

    const rawVideoUrl = selectedMeal.youtube || selectedMeal.strYoutube || selectedMeal.videoUrl;
    const videoId = getYoutubeId(rawVideoUrl);
    const videoContainer = document.querySelector('#video-container');

    if (videoContainer) {
        if (videoId) {
            videoContainer.innerHTML = `<iframe 
                src="https://youtube.com/embed/${videoId}" 
                class="w-full h-64 md:h-96 rounded-xl shadow-sm border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>`;
        } else {
            videoContainer.innerHTML = `
                <div class="bg-gray-50 rounded-xl h-48 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200">
                    <i class="fa-solid fa-video-slash text-2xl mb-2"></i>
                    <p class="text-xs font-medium">No video tutorial available for this recipe</p>
                </div>`;
        }
    }

    analyzeMeals(selectedMeal.ingredients);
});


// ✅ Click listener للـ products
productsGrid.addEventListener('click', (e) => {
    const clickedCard = e.target.closest('.product-card');
    if (!clickedCard) return;

    const cardBarcode = clickedCard.dataset.barcode;
    const selectedProduct = currentProductResults.find(m => String(m.barcode) === String(cardBarcode));
    if (!selectedProduct) return;

    showProductModal(selectedProduct);
});


// --- Back Button ---
backToMealsBtn.addEventListener('click', () => {
    mealDetails.classList.add('hidden');
    allRecipesSection.classList.remove('hidden');
    mealCategoriesSection.classList.remove('hidden');
    searchFiltersSection.classList.remove('hidden');
});


// --- Log Meal Button ---
// ✅ بيقرأ من currentMeal اللي اتحفظت لما الـ user ضغط على الكارت
logMealBtn.addEventListener('click', () => {
    if (!currentMeal) return;
    showMealLog(currentMeal, currentMeal.nutrition);
});


// --- Random Meals ---
async function randomMeals() {
    try {
        const req = await fetch(`https://nutriplan-api.vercel.app/api/meals/random?count=${Math.floor(Math.random() * 25) + 1}`)
        const data = await req.json()
        currentResults = data.results || [];
        renderCards(currentResults);
    } catch {
        console.log('random error');
    }
}

randomMeals();


// --- Search Meals ---
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => searchMeals(searchInput.value), 350);
});

async function searchMeals(findMeal) {
    try {
        if (!findMeal.trim()) {
            currentResults = [];
            recipesGrid.innerHTML = '';
            recipesCount.innerHTML = `Showing 0 recipes`;
            return;
        }
        const req = await fetch(`https://nutriplan-api.vercel.app/api/meals/search?q=${encodeURIComponent(findMeal)}&page=1&limit=25`);
        const data = await req.json();
        currentResults = data.results || [];
        renderCards(currentResults);
    } catch (error) {
        console.log(error);
    }
}


// --- Search Products ---
searchProductBtn.addEventListener('click', () => {
    const searchValue = productSearchInput.value;
    if (!searchValue.trim()) return;
    searchProd(searchValue);
});

async function searchProd(searchValue) {
    try {
        const req = await fetch(`https://nutriplan-api.vercel.app/api/products/search?q=${encodeURIComponent(searchValue)}&page=1&limit=24`);
        const data = await req.json();
        currentProductResults = data.results || [];
        renderProductCards(currentProductResults);
        document.querySelector('#products-count').textContent = `Found ${currentProductResults.length} products for "${searchValue}"`;
    } catch {
        console.log('serPro error');
    }
}


// --- Barcode Search ---
lookupBarcodeBtn.addEventListener('click', () => {
    const barcodeValue = barcodeInput.value;
    if (!barcodeValue.trim()) return;
    searchBarcode(barcodeValue);
});

async function searchBarcode(barcodeValue) {
    try {
        const req = await fetch(`https://nutriplan-api.vercel.app/api/products/barcode/${barcodeValue}`);
        const data = await req.json();
        console.log(data);

        currentProductResults = data.result ? [data.result] : [];

        renderProductCards(currentProductResults);
        document.querySelector('#products-count').textContent = currentProductResults.length
            ? `Found 1 product for barcode "${barcodeValue}"`
            : `No product found for barcode "${barcodeValue}"`;

        if (data.result) showProductModal(data.result);

    } catch {
        console.log('barcode error');
    }
}


// --- Quick Actions ---
firstQuck.addEventListener('click', () => {
    navLink[0].classList.remove(...unActive);
    navLink[0].classList.add(...active);
    navLink[1].classList.remove(...active);
    navLink[1].classList.add(...unActive);
    navLink[2].classList.remove(...active);
    navLink[2].classList.add(...unActive);

    searchFiltersSection.classList.remove('hidden');
    mealCategoriesSection.classList.remove('hidden');
    allRecipesSection.classList.remove('hidden');
    productsSection.classList.add('hidden');
    foodlogSection.classList.add('hidden');
})

secondQuck.addEventListener('click', () => {
    navLink[1].classList.remove(...unActive);
    navLink[1].classList.add(...active);
    navLink[0].classList.remove(...active);
    navLink[0].classList.add(...unActive);
    navLink[2].classList.remove(...active);
    navLink[2].classList.add(...unActive);

    searchFiltersSection.classList.add('hidden');
    mealCategoriesSection.classList.add('hidden');
    allRecipesSection.classList.add('hidden');
    productsSection.classList.remove('hidden');
    foodlogSection.classList.add('hidden');
})