document.addEventListener('DOMContentLoaded', function() {
fetch('nav.html')
.then(response => response.text())
.then(data => {
document.getElementById('nav-placeholder').innerHTML = data;
})
.catch(error => console.error('Ошибка загрузки навигационной панели:', error));

// Получение секции из атрибута data-section
const section = document.body.dataset.section;

// Загрузка рецептов из базы данных
fetch('http://localhost:3000/recipes')
.then(response => {
if (!response.ok) {
throw new Error('Network response was not ok');
}
return response.json();
})
.then(recipes => {
const recipesContainer = document.getElementById('recipes');
const sectionRecipes = recipes.filter(recipe => recipe.section === section);
if (sectionRecipes.length === 0) {
recipesContainer.innerHTML = '<p>Рецепты не найдены.</p>';
} else {
sectionRecipes.forEach(recipe => {
const recipeElement = document.createElement('div');
recipeElement.className = 'recipe';
recipeElement.innerHTML = `
<div class="recipe-content">
<div class="recipe-text">
<h3><a href="recipe.html?id=${recipe._id}">${recipe.title}</a></h3>
<p><strong>Ингредиенты:</strong> ${recipe.description}</p>
<p><strong>Время приготовления:</strong> ${recipe.time}</p>
</div>
${recipe.coverImage ? `<div class="recipe-image"><img src="http://localhost:3000${recipe.coverImage}" alt="${recipe.title}"></div>` : ''}
</div>
`;
recipesContainer.appendChild(recipeElement);
});
}
})
.catch(error => console.error('Ошибка загрузки рецептов:', error));
});
const authData = localStorage.getItem('auth');
// Проверка, что данные существуют
if (authData) {
  // Разбор строки JSON в объект
  const authObject = JSON.parse(authData);
  
  // Получение значения role
  const userRole = authObject.role;
  
  if (userRole === 'admin') {
    document.getElementById('edit-button').style.display = 'inline-block';
    document.getElementById('delete-button').style.display = 'inline-block';
    
    } else {
    document.getElementById('edit-button').style.display = 'none';
    document.getElementById('delete-button').style.display = 'none';
    }
  console.log(userRole);
  } else {
  console.log('No auth data found in localStorage');
  window.location.href = 'index.html';
  }