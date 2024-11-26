async function uploadImage(file, endpoint) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
    });
    
    if (response.ok) {
    const data = await response.json();
    return data.filePath;
    } else {
    console.error('Ошибка при загрузке изображения');
    return null;
    }
    }
    
    async function saveRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (!recipeId) {
    alert('Recipe not found');
    return;
    }
    
    const recipeData = {
    title: document.getElementById('title').value,
    shortDescription: document.getElementById('shortDescription').value,
    description: document.getElementById('description').value,
    time: document.getElementById('time').value,
    section: document.getElementById('section').value,
    steps: [],
    coverImage: '',
    stepImages: []
    };
    
    const coverImageInput = document.getElementById('coverImage');
    if (coverImageInput && coverImageInput.files.length > 0) {
    const coverImageFile = coverImageInput.files[0];
    const coverImagePath = await uploadImage(coverImageFile, 'http://localhost:3000/upload');
    if (coverImagePath) {
    recipeData.coverImage = coverImagePath;
    }
    } else {
        const coverImageElement = document.getElementById('currentCoverImage');
        if (coverImageElement && coverImageElement.src) {
        const coverImageUrl = new URL(coverImageElement.src);
        recipeData.coverImage = coverImageUrl.pathname; // Сохраняем только относительный путь
        } else {
        recipeData.coverImage = ''; // Устанавливаем пустую строку, если изображение удалено
        }
        }
    
    for (let i = 1; i <= document.getElementById('stepCount').value; i++) {
    recipeData.steps.push(document.getElementById(`step${i}`).value);
    const stepImageInput = document.getElementById(`stepImage${i}`);
    if (stepImageInput && stepImageInput.files.length > 0) {
    const stepImageFile = stepImageInput.files[0];
    const stepImagePath = await uploadImage(stepImageFile, 'http://localhost:3000/upload');
    if (stepImagePath) {
    recipeData.stepImages.push(stepImagePath);
    } else {
    recipeData.stepImages.push('');
    }
    } else {
    const stepImageElement = document.querySelector(`#photo-step-${i} img`);
    if (stepImageElement) {
    recipeData.stepImages.push(stepImageElement.src);
    } else {
    recipeData.stepImages.push('');
    }
    }
    }
    
    const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
    method: 'PUT',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(recipeData)
    });
    
    if (response.ok) {
    alert('Recipe updated successfully');
    localStorage.setItem('recipesUpdated', 'true'); // Устанавливаем флаг в localStorage
    closeModal();
    loadRecipePage(); // Перезагрузка страницы для отображения обновленных данных
    } else {
    alert('Failed to update recipe');
    }
    }
    
    $(document).ready(function() {
    // Функция для удаления фотографии
    $(document).on('click', '.delete-photo', function() {
    var photoId = $(this).data('photo-id');
    // Удаление фотографии из формы
    $(`#photo-${photoId}`).remove();
    // Показ кнопки загрузки
    $(`#upload-button-${photoId}`).show();
    });
    
    // Функция для загрузки новой фотографии
    $(document).on('click', '.upload-photo', function() {
    var photoId = $(this).data('photo-id');
    // Логика загрузки фотографии
    });
    });
    
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
    
    // Проверка наличия coverImage
    let coverImageHTML = '';
    if (recipe.coverImage && recipe.coverImage.trim() !== '') {
    coverImageHTML = `<img src="http://localhost:3000${recipe.coverImage}" alt="${recipe.title}">`;
    }
    
    recipeContainer.innerHTML = `
    <h1>${recipe.title}</h1>
    <p><strong>ID рецепта:</strong> ${recipe._id}</p>
    ${coverImageHTML}
    <p><strong>Ингредиенты:</strong> ${recipe.description}</p>
    <p><strong>Время приготовления:</strong> ${recipe.time}</p>
    <h2>Шаги приготовления</h2>
    <div id="steps">
    ${recipe.steps.map((step, index) => `
    <div class="step">
    <p>${step}</p>
    ${recipe.stepImages && recipe.stepImages[index] ? `
    <div id="photo-step-${index + 1}">
    <img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${index + 1}">
    </div>
    ` : ''}
    </div>
    `).join('')}
    </div>
    `;
    }
    
    async function deleteRecipe() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (!recipeId) {
    alert('Recipe not found');
    return;
    }
    
    const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
    method: 'DELETE'
    });
    
    if (response.ok) {
    alert('Recipe deleted successfully');
    window.location.href = '/'; // Перенаправление на главную страницу после удаления
    } else {
    alert('Failed to delete recipe');
    }
    }
    
    function openModal() {
    document.getElementById('myModal').style.display = "block";
    // Предзаполнение формы при открытии модального окна
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    if (recipeId) {
    fetch(`http://localhost:3000/recipes/${recipeId}`)
    .then(response => response.json())
    .then(recipe => {
    document.getElementById('title').value = recipe.title || '';
    document.getElementById('shortDescription').value = recipe.shortDescription || '';
    document.getElementById('description').value = recipe.description || '';
    document.getElementById('time').value = recipe.time || '';
    document.getElementById('section').value = recipe.section || '';
    document.getElementById('stepCount').value = recipe.steps.length || '';
    document.getElementById('currentCoverImage').src = `http://localhost:3000${recipe.coverImage}`;
    
    // Заполнение шагов
    const stepsContainer = document.getElementById('stepsContainer');
    stepsContainer.innerHTML = '';
    recipe.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    stepDiv.innerHTML = `
    <label for="step${index + 1}">Шаг ${index + 1}:</label><br>
    <textarea id="step${index + 1}" name="step${index + 1}" placeholder="Введите шаг">${step}</textarea><br><br>
    ${recipe.stepImages && recipe.stepImages[index] ? `
    <div id="photo-step-${index + 1}">
    <img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${index + 1}">
    <button class="delete-photo" data-photo-id="step-${index + 1}">X</button>
    </div>
    <button id="upload-button-step-${index + 1}" class="upload-photo" data-photo-id="step-${index + 1}" style="display:none;">Загрузить фото</button>
    ` : ''}
    `;
    stepsContainer.appendChild(stepDiv);
    });
    });
    }
    }
    
    function closeModal() {
    document.getElementById('myModal').style.display = "none";
    }
    
    function goBack() {
    const previousPage = document.referrer;
    if (previousPage) {
    window.location.href = previousPage;
    } else {
    window.history.back();
    }
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