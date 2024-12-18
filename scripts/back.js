async function loadRecipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (!recipeId) {
    document.getElementById('recipe-page').innerHTML = '<p>Recipe not found</p>';
    return;
    }
    
    const response = await fetch(`http://localhost:3000/recipes/${recipeId}`);
    const recipe = await response.json();
    const recipeContainer = document.getElementById('recipe-page');
    recipeContainer.innerHTML = `
    <h1>${recipe.title}</h1>
    <p><strong>ID рецепта:</strong> ${recipe._id}</p>
    <img src="http://localhost:3000${recipe.coverImage}" alt="${recipe.title}">
    <p><strong>Ингредиенты:</strong> ${recipe.description}</p>
    <p><strong>Время приготовления:</strong> ${recipe.time}</p>
    <h2>Шаги приготовления</h2>
    <div id="steps">
    ${recipe.steps.map((step, index) => `
    <div class="step">
    <p>${step}</p>
    ${recipe.stepImages && recipe.stepImages[index] ? `<img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${index + 1}">` : ''}
    </div>
    `).join('')}
    </div>
    `;
    }
    
    function goBack() {
        window.history.back();
        setTimeout(() => {
        window.location.reload();
        }, 1000);
        }
    
    // Load the recipe when the page loads
    window.onload = loadRecipePage;
    window.location.reload();