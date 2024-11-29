const express = require("express"); // import libs
const mongoose = require("mongoose"); // import libs
const bodyParser = require("body-parser"); // import libs
const cors = require("cors"); // import libs
const multer = require("multer"); // import libs
const path = require("path"); // import libs
const fs = require("fs"); // import libs
const API_BASE_URL = "thhp://localhost:3000"
const app = express(); // create app sample
const port = process.env.port || 3000; // set server port
// app.listen(port, () => {
// console.log(`App listening at http://localhost:${port}`);
// });

// Middleware
app.use(bodyParser.json()); // json parser
app.use(cors()); // cross domain requests
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // path for images
app.use("/sections", express.static(path.join(__dirname, "..")));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/recipes", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // connect DB

const db = mongoose.connection; // receive object connection
db.on("error", console.error.bind(console, "connection error:")); // log errors
db.once("open", () => {
  console.log("Connected to MongoDB"); // success connection "Connected to MongoDB"
});

// Recipe schema and model - data structure
const recipeSchema = new mongoose.Schema({
  title: String,
  section: String,
  description: String,
  steps: [String],
  time: String,
  coverImage: String,
  stepImages: [String],
});

const Recipe = mongoose.model("Recipe", recipeSchema); // creating the model for mongoDB

// Настройка хранилища для Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Маршрут для загрузки обложки
app.post("/uploadCoverImage", upload.single("file"), (req, res) => {
  console.log("Uploading cover image...");
  if (req.file) {
    console.log("Cover image uploaded:", req.file);
    res.json({ filePath: `/uploads/${req.file.filename}` });
  } else {
    console.error("No file uploaded for cover image");
    res.status(400).json({ message: "No file uploaded" });
  }
});

// Маршрут для загрузки изображений шагов
app.post("/uploadStepImage", upload.single("file"), (req, res) => {
  console.log("Uploading step image...");
  if (req.file) {
    console.log("Step image uploaded:", req.file);
    res.json({ filePath: `/uploads/${req.file.filename}` });
  } else {
    console.error("No file uploaded for step image");
    res.status(400).json({ message: "No file uploaded" });
  }
});

// Маршрут для обработки формы рецепта
app.post(
  "/recipes",
  (req, res, next) => {
    console.log("Processing recipe form...");
    upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "stepImages[]", maxCount: 15 },
    ])(req, res, function (err) {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({ message: "File upload error" });
      }
      console.log("Files after multer:", req.files);
      next();
    });
  },
  async (req, res) => {
    try {
      console.log("Saving recipe...");
      const {
        title,
        section,
        description,
        steps,
        time,
        coverImage,
        stepImages,
      } = req.body;

      // Отладочные сообщения
      console.log("Request body:", req.body);
      console.log("Files:", req.files);
      console.log(
        "Cover Image:",
        req.files ? req.files["coverImage"] : "No cover image"
      );
      console.log(
        "Step Images:",
        req.files ? req.files["stepImages[]"] : "No step images"
      );

      // Сохранение рецепта в базе данных
      const recipe = new Recipe({
        title,
        section,
        description,
        steps,
        time,
        coverImage,
        stepImages,
      });
      await recipe.save();

      console.log("Recipe saved successfully");
      res.json({ message: "Recipe saved successfully", section });
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Route to get recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get a recipe by ID
app.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to delete recipe
app.delete("/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;
  try {
    const result = await Recipe.findByIdAndDelete(recipeId);
    if (result) {
      res.status(200).send({ message: "Recipe deleted successfully" });
    } else {
      res.status(404).send({ message: "Recipe not found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Failed to delete recipe", error });
  }
});

// Обновление рецепта
app.put("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    const updatedData = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      time: req.body.time,
      section: req.body.section,
      steps: req.body.steps,
      stepImages: req.body.stepImages,
    };
console.log(req.body.stepImages)
    // Проверка на пустое значение coverImage
    if (req.body.coverImage && req.body.coverImage.trim() === "") {
      delete updatedData.coverImage;
    } else {
      updatedData.coverImage = req.body.coverImage;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      updatedData,
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).send("Recipe not found");
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // Для обслуживания загруженных файлов

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
