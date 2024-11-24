document.addEventListener('DOMContentLoaded', function() {
    fetch('nav.html')
    .then(response => response.text())
    .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Ошибка загрузки навигационной панели:', error));
    
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
    // Инициализация с 2 шагами по умолчанию
    stepCountInput.value = 2;
    stepCountInput.onchange();
    }
    });