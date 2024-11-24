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

    function saveRecipe() {
        const title = document.getElementById('title');
        const stepCount = document.getElementById('stepCount');
        const section = document.getElementById('section');
        const shortDescription = document.getElementById('shortDescription');
        const description = document.getElementById('description');
        const time = document.getElementById('time');
        const coverImage = document.getElementById('coverImage');
        
        if (title && stepCount && section && shortDescription && description && time && coverImage) {
        const recipe = {
        title: title.value,
        stepCount: stepCount.value,
        section: section.value,
        shortDescription: shortDescription.value,
        description: description.value,
        time: time.value,
        coverImage: coverImage.files[0] ? coverImage.files[0].name : ''
        };
        
        console.log('Recipe saved:', recipe);
        // Здесь можно добавить код для сохранения рецепта
        
        // Закрываем модальное окно после сохранения
        closeModal();
        } else {
        console.error('One or more form elements are missing.');
        }
        }
        
        function editRecipe() {
        const modal = document.getElementById('myModal');
        if (modal) {
        modal.style.display = 'block';
        }
        }
        
        function closeModal() {
        const modal = document.getElementById('myModal');
        if (modal) {
        modal.style.display = 'none';
        }
        }
        
        document.addEventListener('DOMContentLoaded', () => {
        const saveButton = document.querySelector('button[onclick="saveRecipe()"]');
        if (saveButton) {
        saveButton.addEventListener('click', saveRecipe);
        }
        });