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
};

// Настройка Multer для обработки полей формы
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
<p><strong>Время приготовления:</strong> ${time}</p>
<p><strong>Ингридиенты:</strong> ${description}</p>
<p><strong>Шаги приготовления:</strong></p>
${JSON.parse(steps).map((step, index) => `
<div>
<p>Шаг ${index + 1}: ${step}</p>
${stepImages[index] ? `<img src="http://localhost:3000${stepImages[index]}" alt="Шаг ${index + 1}">` : ''}
</div>
`).join('')}

</div>
<script src="../scripts/recipe.js"></script>
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