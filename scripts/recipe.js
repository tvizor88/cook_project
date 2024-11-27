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

  const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
  });

  if (response.ok) {
    alert("Recipe updated successfully");
    localStorage.setItem("recipesUpdated", "true"); // Устанавливаем флаг в localStorage
    closeModal();
    loadRecipePage(); // Перезагрузка страницы для отображения обновленных данных
  } else {
    alert("Failed to update recipe");
  }
}

$(document).ready(function () {
  // Функция для удаления фотографии
  $(document).on("click", ".delete-photo", function () {
    var photoId = $(this).data("photo-id");
    // Удаление фотографии из формы
    $(`#photo-${photoId}`).remove();
  });

  // Функция для загрузки новой фотографии
  $(document).on("click", ".upload-photo", function () {
    var photoId = $(this).data("photo-id");
    // Логика загрузки фотографии
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
    <img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${
            index + 1
          }">
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
      
      window.location.href = "/"; // Перенаправление на главную страницу после удаления
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
        <textarea id="step${i}" name="step${i}" placeholder="Введите шаг"></textarea><br><br>
        <input type="file" id="stepImage${i}" name="stepImages[]" accept="image/*"><br>
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
            stepImageDiv.id = `photo-step-${index + 1}`;
            stepImageDiv.innerHTML = `
        <img src="http://localhost:3000${recipe.stepImages[index]}" alt="Шаг ${
              index + 1
            }">
        <button class="delete-photo" data-photo-id="step-${
          index + 1
        }">X</button>
        `;
            document
              .getElementById(`stepImage${index + 1}`)
              .parentNode.insertBefore(
                stepImageDiv,
                document.getElementById(`stepImage${index + 1}`)
              );
            document.getElementById(`stepImage${index + 1}`).style.display =
              "none";
          }
        });
      });
  }
}

function closeModal() {
  document.getElementById("myModal").style.display = "none";
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
  }
 

// Load the recipe when the page loads
window.onload = loadRecipePage;
