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
    
    // Предзаполнение формы
    document.getElementById('title').value = recipe.title;
    document.getElementById('shortDescription').value = recipe.shortDescription || '';
    document.getElementById('description').value = recipe.description;
    document.getElementById('time').value = recipe.time;
    document.getElementById('section').value = recipe.section;
    document.getElementById('stepCount').value = recipe.steps.length;
    
    // Заполнение шагов
    const stepsContainer = document.getElementById('stepsContainer');
    stepsContainer.innerHTML = '';
    recipe.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    stepDiv.innerHTML = `
    <label for="step${index + 1}">Шаг ${index + 1}:</label><br>
    <textarea id="step${index + 1}" name="step${index + 1}" placeholder="Введите шаг">${step}</textarea><br><br>
    ${recipe.stepImages && recipe.stepImages[index] ? `<img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${index + 1}"><br><br>` : ''}
    `;
    stepsContainer.appendChild(stepDiv);
    });
    }
    
    function openModal() {
    document.getElementById('myModal').style.display = "block";
    }
    
    function closeModal() {
    document.getElementById('myModal').style.display = "none";
    }
    
    // When the user clicks on <span> (x), close the modal
    document.querySelector('.close').onclick = function() {
    closeModal();
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == document.getElementById('myModal')) {
    closeModal();
    }
    }
    
    // Load the recipe when the page loads
    window.onload = loadRecipePage;
    