    document.getElementById('time-filter').addEventListener('change', function() {
    console.log('Фильтр изменен на:', this.value);
    
    const selectedValue = this.value;
    const recipes = document.querySelectorAll('.recipe');
    console.log(recipes);
    recipes.forEach(recipe => {
    const time = parseInt(recipe.getAttribute('data-time'), 10);
    console.logtime;
    switch (selectedValue) {
    case '30-60':
    recipe.style.display = (time >= 30 && time < 60) ? 'block' : 'none';
    break;
    case '60-120':
    recipe.style.display = (time >= 60 && time < 120) ? 'block' : 'none';
    break;
    case '120-180':
    recipe.style.display = (time >= 120 && time < 180) ? 'block' : 'none';
    break;
    default:
    recipe.style.display = 'block';
    break;
    }
    });
    });