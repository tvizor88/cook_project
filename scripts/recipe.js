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
    recipeData.coverImage = coverImageElement.src;
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
    