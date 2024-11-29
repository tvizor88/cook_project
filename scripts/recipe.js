async function uploadImage(file, endpoint) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Uploaded image path:", data); // Добавьте это
      return data.filePath;
    } else {
      console.error("Ошибка при загрузке изображения");
      return null;
    }
  } catch (error) {
    console.error("Ошибка при загрузке изображения:", error);
    return null;
  }
}

async function saveRecipe() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  if (!recipeId) {
    alert("Recipe not found");
    return;
  }

  const recipeData = {
    title: document.getElementById("title").value,
    shortDescription: document.getElementById("shortDescription").value,
    description: document.getElementById("description").value,
    time: document.getElementById("time").value,
    section: document.getElementById("section").value,
    steps: [],
    coverImage: "",
    stepImages: [],
  };

  const coverImageInput = document.getElementById("coverImage");
  if (coverImageInput && coverImageInput.files.length > 0) {
    const coverImageFile = coverImageInput.files[0];
    const coverImagePath = await uploadImage(
      coverImageFile,
      "http://localhost:3000/uploadCoverImage"
    );
    if (coverImagePath) {
      recipeData.coverImage = coverImagePath;
    }
  } else {
    const coverImageElement = document.getElementById("currentCoverImage");
    if (coverImageElement && coverImageElement.src) {
      const coverImageUrl = new URL(coverImageElement.src);
      recipeData.coverImage = coverImageUrl.pathname; // Сохраняем только относительный путь
    } else {
      recipeData.coverImage = ""; // Устанавливаем пустую строку, если изображение удалено
    }
  }

  for (let i = 1; i <= document.getElementById("stepCount").value; i++) {
    recipeData.steps.push(document.getElementById(`step${i}`).value);
    const stepImageInput = document.getElementById(`stepImage${i}`);
    if (stepImageInput && stepImageInput.files.length > 0) {
      const stepImageFile = stepImageInput.files[0];
      const stepImagePath = await uploadImage(
        stepImageFile,
        "http://localhost:3000/uploadStepImage"
      );
      if (stepImagePath) {
        recipeData.stepImages.push(stepImagePath);
        console.log("Recipe data before saving:", recipeData); 
        console.log("Recipe data before saving:", stepImagePath);
      } else {
        recipeData.stepImages.push("");
      }
    } else {
      const stepImageElement = document.querySelector(`#photo-step-${i} img`);
      if (stepImageElement) {
        const stepImageUrl = new URL(stepImageElement.src);
        recipeData.stepImages.push(stepImageUrl.pathname); // Сохраняем только относительный путь
      } else {
        recipeData.stepImages.push("");
      }
    }
  }
  console.log("Recipe data before saving:", recipeData); 

  const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
    
  });
  console.log("put method data",recipeData)
  if (response.ok) {
    localStorage.setItem("recipesUpdated", "true"); // Устанавливаем флаг в localStorage
    closeModal();
   loadRecipePage(); // Перезагрузка страницы для отображения обновленных данных
  } else {
    alert("Failed to update recipe");
  }
}
//delete cover ing
$(document).ready(function () {
  // Функция для удаления фотографии
  $(document).on("click", ".delete-photo", function () {
    var photoId = $(this).data("photo-id");
    console.log(photoId)
    // Удаление фотографии из формы
    $(`#photo-${photoId}`).remove();
  });

  // Функция для загрузки новой фотографии
  $(document).on("click", ".upload-photo", function () {
    var photoId = $(this).data("photo-id");
    // Логика загрузки фотографии
  });
});
//delete step img
$(document).ready(function () {
  // Функция для удаления фотографии
  $(document).on("click", ".delete-photo", function (event) {
  event.preventDefault(); // Отменяем стандартное поведение кнопки
  var photoId = $(this).data("photo-id");
  console.log(photoId);
  // Удаление фотографии из DOM
  $(`#photo-${photoId}`).remove();
  // Добавление нового элемента input
  $('<input>', {type: 'file',id: `stepImage${photoId}`,name: 'stepImages[]',accept: 'image/*',style: 'display: block'}).appendTo('stepsContainer.step');
  });
  });

async function loadRecipePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  if (!recipeId) {
    document.getElementById("recipe-page").innerHTML =
      "<p>Recipe not found</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/recipes/${recipeId}`);
    const recipe = await response.json();
    console.log("Loaded recipe data:", recipe); // Добавьте это
    const recipeContainer = document.getElementById("recipe-page");

    // Проверка наличия coverImage
    let coverImageHTML = "";
    if (recipe.coverImage && recipe.coverImage.trim() !== "") {
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
    ${recipe.steps
      .map(
        (step, index) => `
    <div class="step">
   
    <p>${step}</p>
    ${
      recipe.stepImages && recipe.stepImages[index]
        ? `
    <div id="photo-step-${index + 1}">
    <div id="________________________________________">
    <img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${index + 1}">
       
    </div>
    `
        : ""
    }
    </div>
    `
      )
      .join("")}
    </div>
    `;
  } catch (error) {
    console.error("Ошибка при загрузке рецепта:", error);
  }
}

async function deleteRecipe() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  if (!recipeId) {
  alert("Recipe not found");
  return;
  }
  
  try {
  const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
  method: "DELETE",
  });
  
  if (response.ok) {

console.log(response)
  // Извлечение секции из localStorage
  const currentSection = localStorage.getItem('currentSection');
  console.log(currentSection)

  if (currentSection) {
  // Перенаправление на страницу секции
  window.location.href = `${currentSection}.html`;
  } else {
  // Перенаправление на главную страницу, если секция не найдена
  window.location.href = 'index.html';
  }
  } else {
  alert("Failed to delete recipe");
  }
  } catch (error) {
  console.error("Ошибка при удалении рецепта:", error);
  }
  }

function updateSteps() {
  const stepCount = parseInt(document.getElementById("stepCount").value);
  const stepsContainer = document.getElementById("stepsContainer");
  stepsContainer.innerHTML = "";

  for (let i = 1; i <= stepCount; i++) {
    const stepDiv = document.createElement("div");
    stepDiv.className = "step";
    stepDiv.innerHTML = `
        <label for="step${i}">Шаг ${i}:</label><br>
        <textarea id="step${i}" name="step${i}" placeholder="Введите шаг"></textarea><br>
        <input type="file" id="stepImage${i}" name="stepImages[]" accept="image/*" style="dispaly:block"><br><br><br><br><br>
        `;
    stepsContainer.appendChild(stepDiv);
  }
}

document.getElementById("stepCount").addEventListener("change", updateSteps);

function openModal() {
  document.getElementById("myModal").style.display = "block";
  // Предзаполнение формы при открытии модального окна
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get("id");
  if (recipeId) {
  fetch(`http://localhost:3000/recipes/${recipeId}`)
  .then((response) => response.json())
  .then((recipe) => {
  document.getElementById("title").value = recipe.title || "";
  document.getElementById("shortDescription").value =
  recipe.shortDescription || "";
  document.getElementById("description").value = recipe.description || "";
  document.getElementById("time").value = recipe.time || "";
  document.getElementById("section").value = recipe.section || "";
  document.getElementById("stepCount").value = recipe.steps.length || "";
  document.getElementById(
  "currentCoverImage"
  ).src = `http://localhost:3000${recipe.coverImage}`;
  
  // Обновляем шаги
  updateSteps();
  
  // Заполнение шагов
  recipe.steps.forEach((step, index) => {
  document.getElementById(`step${index + 1}`).value = step;
  if (recipe.stepImages && recipe.stepImages[index]) {
  const stepImageDiv = document.createElement("div");
  stepImageDiv.id = `stepImage-${index + 1}`;
  stepImageDiv.style.position = "relative"; // Добавлено для позиционирования кнопки
  stepImageDiv.innerHTML = `
  <img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${index + 1}" style="width: 50%;"><br>
  <button class="delete-photo" data-photo-id="step-${index + 1}" style="position: absolute; top: 10px; right: 10px;">delete step ${index + 1} photo</button>

  `;
  document
  .getElementById(`stepImage${index + 1}`)
  .parentNode.insertBefore(
  stepImageDiv,
  document.getElementById(`stepImage${index + 1}`)
  );
  document.getElementById(`stepImage${index + 1}`).style.display =
  "none";
  
  // Добавляем обработчик для кнопки удаления
  stepImageDiv.querySelector('.delete-photo').addEventListener('click', function() {
    // Удаление изображения
    stepImageDiv.querySelector('img').remove(); 
    
    // parent.removeChild(stepImageDiv);
    // stepImageDiv.appendChild(newLabel);
    // stepImageDiv.appendChild(newInputFile);
    // parent.insertBefore(stepImageDiv, nextSibling);

    // Создаем новые элементы input и label
    const newInputFile = document.createElement('input');
    newInputFile.type = 'file';
    newInputFile.id = `stepImage${index+1}`;
    newInputFile.name = 'stepImages[]';
    newInputFile.accept = 'image/*';
    newInputFile.style.display = 'block';
    
    const newLabel = document.createElement('label');
    newLabel.htmlFor = `stepImage${index+1}`;
    newLabel.style.display = 'block';
    newLabel.textContent = `Загрузить новую фотографию для шага ${index + 1}`;
    
    const parent = stepImageDiv.parentNode;
    const nextSibling = stepImageDiv.nextSibling;
    parent.removeChild(stepImageDiv);
    stepImageDiv.appendChild(newLabel);
    stepImageDiv.appendChild(newInputFile);
    parent.insertBefore(stepImageDiv, nextSibling);
    
    // Удаление кнопки
    this.remove(); 
    });
  }
  });
  });
  }
  }
  
  

function closeModal() {
  document.getElementById("myModal").style.display = "none";
}
document.addEventListener('DOMContentLoaded', function() {
  // Обработчик клика для кнопок удаления
  document.querySelectorAll('.delete-step-image').forEach(button => {
  button.addEventListener('click', function() {
  const stepId = this.getAttribute('data-step-id');
  const stepImageDiv = document.getElementById(`img${stepId}`);
  if (stepImageDiv) {
    console.log(stepImageDiv)
  stepImageDiv.remove(); // Удаление элемента из DOM
  }
  // Добавление нового элемента input
  const inputElement = document.createElement('input');
  inputElement.type = 'file';
  inputElement.id = `stepImage${stepId}`;
  inputElement.name = 'stepImages[]';
  inputElement.accept = 'image/*';
  inputElement.style.display = 'block';
  // Добавление input после кнопки удаления
  this.stepsContainer.appendChild(inputElement);
  });
  });
  });
function goBack() {
  const currentSection = localStorage.getItem('currentSection');
  console.log(currentSection)

  if (currentSection) {
  // Перенаправление на страницу секции
  window.location.href = `${currentSection}.html`;
  } else {
  // Перенаправление на главную страницу, если секция не найдена
  window.location.href = 'index.html';
  
  } }
  

document.addEventListener('DOMContentLoaded', function() {
  // Проверка наличия данных аутентификации в localStorage
  const authData = localStorage.getItem('auth');
  if (authData) {
  fetch('nav.html')
  .then(response => response.text())
  .then(data => {
  document.getElementById('nav-placeholder').innerHTML = data;
  })
  .catch(error => console.error('Ошибка загрузки навигационной панели:', error));
  } else {
  console.log('Пользователь не аутентифицирован, навигационная панель не загружается');
  window.location.href = 'index.html';
  }
  });
  
  // Получение секции из атрибута data-section
  const section = document.body.dataset.section;
  
// When the user clicks on <span> (x), close the modal
document.querySelector(".close").onclick = function () {
  closeModal();
};
function logout() {
  localStorage.clear();
  // Скрываем элементы страницы
  toggleDisplay('header', false);
  toggleDisplay('nav', false);
  toggleDisplay('.container', false);
  toggleDisplay('nav-placeholder', false); // Скрываем nav-placeholder
  toggleDisplay('body', false);
  // Показываем модальное окно аутентификации
  const authModal = document.getElementById('authModal');
  if (authModal) {
  authModal.style.display = 'block';
  // Перезагружаем страницу после отображения модального окна
  setTimeout(() => {
  location.reload();
  }, 1000); // Небольшая задержка для отображения модального окна
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
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == document.getElementById("myModal")) {
    closeModal();
  }
};
// Получение строки JSON из localStorage
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
 
  // document.addEventListener('DOMContentLoaded', function() {
  //   document.getElementById('edit-button').addEventListener('click', saveRecipeToLocalStorage);
  // });
  // function saveRecipeToLocalStorage() {
  //   // Получение данных рецепта
  //   const recipeTitle = document.getElementById('title').innerHTML;
  //   const recipeDescription = document.getElementById('description').innerText;
  //   const coverImage = document.getElementById('currentCoverImage').src;
    
  //   // Получение шагов и изображений шагов
  //   const steps = [];
  //   const stepsImages = [];
  //   const stepsContainer = document.getElementById('stepsContainer');
  //   const stepElements = stepsContainer.getElementsByClassName('step');
    
  //   Array.from(stepElements).forEach(stepElement => {
  //   const stepText = stepElement.querySelector('.step.text').innerText;
  //   const stepImage = stepElement.querySelector('.step.image').src;
    
  //   steps.push(stepText);
  //   stepsImages.push(stepImage);
  //   });
    
  //   // Сохранение данных в localStorage
  //   const recipeData = {
  //   title: recipeTitle,
  //   description: recipeDescription,
  //   coverImage: coverImage,
  //   steps: steps,
  //   stepsImages: stepsImages
  //   };
    
  //   localStorage.setItem('recipeData', JSON.stringify(recipeData));
  //   alert('Данные рецепта сохранены в localStorage!');
  //   }
    
  //   // Пример использования: добавьте этот обработчик к кнопке "Edit"
   







  

// Load the recipe when the page loads
window.onload = loadRecipePage;
