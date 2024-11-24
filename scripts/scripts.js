// Функция аутентификации
function authenticate() {
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;
    
    if (username === 'admin' && password === 'admin') {
    localStorage.setItem('auth', JSON.stringify({ role: 'admin', timestamp: new Date().getTime() }));
    loadPage(true);
    } else if (username === 'user' && password === 'user') {
    localStorage.setItem('auth', JSON.stringify({ role: 'user', timestamp: new Date().getTime() }));
    loadPage(false);
    } else {
    document.getElementById('authError').style.display = 'block';
    }
    }
    
    // Функция загрузки страницы
    function loadPage(isAdmin) {
    toggleDisplay('authModal', false);
    toggleDisplay('header', true);
    toggleDisplay('nav', true);
    toggleDisplay('.container', true);
    
    if (isAdmin) {
    toggleDisplay('addRecipeBtn', true);
    }
    }
    
    // Функция проверки аутентификации
    function checkAuth() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (auth) {
    const currentTime = new Date().getTime();
    const oneHour = 60 * 60 * 1000;
    if (currentTime - auth.timestamp < oneHour) {
    loadPage(auth.role === 'admin');
    } else {
    localStorage.removeItem('auth');
    }
    }
    }
    
    // Функция выхода из системы
    function logout() {
    localStorage.clear();
    // Скрываем элементы страницы
    toggleDisplay('header', false);
    toggleDisplay('nav', false);
    toggleDisplay('.container', false);
    // Показываем модальное окно аутентификации
    const authModal = document.getElementById('authModal');
    if (authModal) {
    authModal.style.display = 'block';
    // Перезагружаем страницу после отображения модального окна
    setTimeout(() => {
    location.reload();
    }, 100); // Небольшая задержка для отображения модального окна
    } else {
    // Если модальное окно не найдено, перенаправляем на index.html
    sessionStorage.setItem('showAuthModal', 'true');
    window.location.href = 'index.html';
    }
    }
    
    // Функция переключения отображения элементов
    function toggleDisplay(selector, show) {
    const element = document.querySelector(selector) || document.getElementById(selector);
    if (element) {
    element.style.display = show ? 'block' : 'none';
    }
    }
    
    // Проверка авторизации при загрузке страницы
    window.onload = function() {
    checkAuth();
    if (sessionStorage.getItem('showAuthModal') === 'true') {
    const authModal = document.getElementById('authModal');
    if (authModal) {
    authModal.style.display = 'block';
    }
    sessionStorage.removeItem('showAuthModal');
    }
    };
    
    // Прорисовка nav-Panel
    const addRecipeBtn = document.getElementById('addRecipeBtn');
    if (addRecipeBtn) {
    addRecipeBtn.onclick = function() {
    document.getElementById('myModal').style.display = 'block';
    };
    }
    
    // Обработчики событий для модальных окон
    const closeBtn = document.getElementsByClassName('close')[0];
    if (closeBtn) {
    closeBtn.onclick = function() {
    document.getElementById('myModal').style.display = 'none';
    };
    }
    
    window.onclick = function(event) {
    const myModal = document.getElementById('myModal');
    if (event.target == myModal) {
    myModal.style.display = 'none';
    }
    };
    
    // Обработчик изменения количества шагов
    const stepCountInput = document.getElementById('stepCount');
    if (stepCountInput) {
    stepCountInput.onchange = function() {
    const stepCount = parseInt(this.value);
    const stepsContainer = document.getElementById('stepsContainer');
    stepsContainer.innerHTML = '';
    for (let i = 1; i <= stepCount; i++) {
    const stepDiv = document.createElement('div');
    stepDiv.innerHTML = `
    <label for="step${i}">Шаг ${i}:</label><br>
    <textarea id="step${i}" name="steps[]"></textarea><br><br>
    <label for="stepImage${i}">Загрузить фото:</label><br>
    <input type="file" id="stepImage${i}" name="stepImages[]"><br><br>
    `;
    stepsContainer.appendChild(stepDiv);
    }
    };
    }
    
    // Функция сохранения рецепта
    async function saveRecipe() {
    const title = document.getElementById('title').value;
    const section = document.getElementById('section').value;
    const shortDescription = document.getElementById('shortDescription').value;
    const description = document.getElementById('description').value.replace(/\n/g, '<br>').replace(/^/, '<br>');
    const steps = Array.from(document.querySelectorAll('textarea[name="steps[]"]')).map(textarea => textarea.value);
    const time = document.getElementById('time').value;
    const coverImage = document.getElementById('coverImage').files[0];
    const stepImages = Array.from(document.querySelectorAll('input[name="stepImages[]"]')).map(input => input.files[0]);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('section', section);
    formData.append('shortDescription', shortDescription);
    formData.append('description', description);
    formData.append('steps', JSON.stringify(steps));
    formData.append('time', time);
    if (coverImage) {
    formData.append('coverImage', coverImage);
    }
    stepImages.forEach((file, index) => {
    if (file) {
    formData.append('stepImages[]', file);
    }
    });
    
    const response = await fetch('http://localhost:3000/recipes', {
    method: 'POST',
    body: formData
    });
    
    if (response.ok) {
    document.getElementById('myModal').style.display = 'none';
    const result = await response.json();
    // Перенаправление на соответствующую страницу
    const sectionPageMap = {
    'first': 'first.html',
    'second': 'second.html',
    'dough': 'dough.html',
    'healthy': 'healthy.html',
    'salads': 'salads.html',
    'all': 'all.html'
    };
    window.location.href = sectionPageMap[section] || 'index.html';
    } else {
    console.error('Ошибка при сохранении рецепта');
    }
    }
    
    async function loadRecipes(section) {
        const response = await fetch('http://localhost:3000/recipes');
        const recipes = await response.json();
        const sectionRecipes = recipes.filter(recipe => recipe.section === section);
        const recipesContainer = document.getElementById('recipes');
        recipesContainer.innerHTML = ''; // Очистка контейнера перед добавлением новых рецептов
        
        sectionRecipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';
        recipeDiv.innerHTML = `
        <div class="recipe-content">
        <h3><a href="recipes/${recipe.title}.html">${recipe.title}</a></h3>
        <p><strong>Ингридиенты:</strong> ${recipe.description}</p>
        <p><strong>Время приготовления:</strong> ${recipe.time}</p>
        </div>
        ${recipe.coverImage ? `<img src="http://localhost:3000${recipe.coverImage}" alt="${recipe.title}">` : ''}
        `;
        recipesContainer.appendChild(recipeDiv);
        });
        }
        