function editRecipe() {
    // Проверяем наличие элементов на странице
    const titleElement = document.querySelector('header h1');
    const descriptionElement = document.getElementById('recipeDescription');
    const timeElement = document.getElementById('recipeTime');
    
    if (!titleElement || !descriptionElement || !timeElement) {
    console.error('Не удалось найти один или несколько элементов рецепта.');
    return;
    }
    
    // Получаем данные рецепта
    const title = titleElement.innerText;
    const description = descriptionElement.innerHTML.replace(/<br>/g, '\n');
    const time = timeElement.innerText;
    const section = 'all'; // Предположим, что раздел известен или хранится где-то
    const shortDescription = ''; // Предположим, что краткое описание хранится где-то
    const stepCount = 3; // Предположим, что количество шагов известно или хранится где-то
    
    // Заполняем форму данными рецепта
    document.getElementById('title').value = title;
    document.getElementById('description').value = description;
    document.getElementById('time').value = time;
    document.getElementById('section').value = section;
    document.getElementById('shortDescription').value = shortDescription;
    document.getElementById('stepCount').value = stepCount;
    
    // Открываем модальное окно
    document.getElementById('myModal').style.display = 'block';
    }
    
    function closeModal() {
    document.getElementById('myModal').style.display = 'none';
    }