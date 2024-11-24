const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/sections', express.static(path.join(__dirname, '..'))); // Добавляем эту строку

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/recipes', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
console.log('Connected to MongoDB');
});

// Recipe schema and model
const recipeSchema = new mongoose.Schema({
title: String,
section: String,
description: String,
steps: [String],
time: String,
coverImage: String,
stepImages: [String]
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Настройка хранилища для Multer
const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, 'uploads/');
},
filename: function (req, file, cb) {
cb(null, Date.now() + '-' + file.originalname);
}
});

// Настройка фильтра файлов для Multer
const fileFilter = (req, file, cb) => {
if (file.mimetype.startsWith('image/')) {
cb(null, true);
} else {
cb(new Error('Invalid file type'), false);
}
};// Настройка Multer для обработки полей формы
const upload = multer({
storage: storage,
fileFilter: fileFilter
}).fields([
{ name: 'coverImage', maxCount: 1 },
{ name: 'stepImages[]', maxCount: 15 }
]);

// Маршрут для обработки формы
app.post('/recipes', upload, async (req, res) => {
try {
const { title, section, description, steps, time } = req.body;
const coverImage = req.files['coverImage'] ? `/uploads/${req.files['coverImage'][0].filename}` : '';
const stepImages = req.files['stepImages[]'] ? req.files['stepImages[]'].map(file => `/uploads/${file.filename}`) : [];

const recipe = new Recipe({ title, section, description, steps: JSON.parse(steps), time, coverImage, stepImages });
await recipe.save();

// Создание HTML-файла на уровень выше
const fileName = `${title}.html`;
const dirPath = path.join(__dirname, '..', 'recipes');
const filePath = path.join(dirPath, fileName);

// Проверка и создание директории, если она не существует
if (!fs.existsSync(dirPath)) {
fs.mkdirSync(dirPath, { recursive: true });
}
const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
body {
font-family: Arial, sans-serif;
margin: 0;
padding: 20px;
background-color: #f8f8f8;
}
header {
display: flex;
justify-content: space-between;
align-items: center;
color: white;
padding: 10px;
}
header button {
background-color: white;
color: #ff6347;
border: none;
padding: 10px 20px;
cursor: pointer;
}
header button:hover {
background-color: #e5533d;
color: white;
}
h1 {
color: #e5533d;
}
.recipe {
border: 1px solid #ddd;
padding: 10px;
margin-bottom: 10px;
background-color: #fff;
}
.recipe img {
max-width: 200px;
height: auto;
margin-left: 20px;
}
.modal {
display: none;
position: fixed;
z-index: 1;
left: 0;
top: 0;
width: 100%;
height: 100%;
overflow: auto;
background-color: rgb(0,0,0);
background-color: rgba(0,0,0,0.4);
}
.modal-content {
background-color: #fefefe;
margin: 15% auto;
padding: 20px;
border: 1px solid #888;
width: 80%;
}
.close {
color: #aaa;
float: right;
font-size: 28px;
font-weight: bold;
}
.close:hover,
.close:focus {
color: black;
text-decoration: none;
cursor: pointer;
}
</style>
</head>
<body>
<header>
<h1>${title}</h1>
<button onclick="editRecipe()">Редактировать</button>
<button onclick="history.back()">Назад</button>
<button onclick="location.href='../index.html'">Домой</button>
</header>
<div class="recipe">
${coverImage ? `<img src="http://localhost:3000${coverImage}" alt="${title}" style="max-width: 400px; height: auto;">` : ''}
<p><strong>Время приготовления:</strong> <span id="recipeTime">${time}</span></p>
<p><strong>Ингредиенты:</strong> <span id="recipeDescription">${description}</span></p>
<p><strong>Шаги приготовления:</strong></p>
${JSON.parse(steps).map((step, index) => `
<div>
<p>Шаг ${index + 1}: ${step}</p>
${stepImages[index] ? `<img src="http://localhost:3000${stepImages[index]}" alt="Шаг ${index + 1}">` : ''}
</div>
`).join('')}
</div>

<!-- Модальное окно для редактирования рецепта -->
<div id="myModal" class="modal">
<div class="modal-content">
<span class="close" onclick="closeModal()">×</span>
<h2>Редактировать рецепт</h2>
<form id="recipeForm">
<label for="title">Название:</label><br>
<input type="text" id="title" name="title" placeholder="Введите название рецепта"><br><br>

<label for="stepCount">Количество шагов:</label><br>
<select id="stepCount" name="stepCount">
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
<option value="10">10</option>
<option value="11">11</option>
<option value="12">12</option>
<option value="13">13</option>
<option value="14">14</option>
<option value="15">15</option>
</select><br><br>

<label for="section">Раздел:</label><br>
<select id="section" name="section">
<option value="first">Первое</option>
<option value="second">Второе</option>
<option value="dough">Тесто</option>
<option value="healthy">Правильное питание</option>
<option value="salads">Салаты</option>
<option value="all">Все подряд</option>
</select><br><br>

<label for="shortDescription">Краткое описание:</label><br>
<textarea id="shortDescription" name="shortDescription" placeholder="Введите краткое описание"></textarea><br><br>

<label for="description">Ингредиенты:</label><br>
<textarea id="description" name="description" placeholder="Введите ингредиенты, каждый с новой строки"></textarea><br><br>

<label for="time">Время приготовления:</label><br>
<input type="text" id="time" name="time" placeholder="Введите время приготовления"><br><br>

<label for="coverImage">Загрузить обложку:</label><br>
<input type="file" id="coverImage" name="coverImage"><br><br>

<div id="stepsContainer"></div>

<button type="button" onclick="saveRecipe()">Сохранить рецепт</button>
</form>
</div>
</div>

<script src="../scripts/editRecipe.js"></script>
</body>
</html>
`;

fs.writeFile(filePath, htmlContent, (err) => {
if (err) {
console.error('Ошибка при создании HTML-файла:', err);
}
});

res.json({ message: 'Recipe saved successfully', section });
} catch (error) {
console.error('Error saving recipe:', error);
res.status(500).json({ message: 'Internal Server Error' });
}
});

// Маршрут для получения рецептов
app.get('/recipes', async (req, res) => {
try {
const recipes = await Recipe.find();
res.json(recipes);
} catch (error) {
console.error('Error fetching recipes:', error);
res.status(500).json({ message: 'Internal Server Error' });
}
});

// Запуск сервера
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
