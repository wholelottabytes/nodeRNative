require("dotenv").config();
const express = require("express");
const Beat = require("../models/Beat");
const User = require("../models/User"); // Добавили импорт User
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    console.error("❌ JWT_SECRET не определён в переменных окружения!");
}

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Токен не предоставлен" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Неверный формат токена" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY); // ✅ важно: SECRET_KEY должен быть определён
        req.user = decoded; // decoded = { userId: ... }
        next();
    } catch (error) {
        console.error("Ошибка верификации токена:", error.message);
        return res.status(401).json({ message: "Неверный или просроченный токен" });
    }
};
// Конфигурация для загрузки изображений и аудиофайлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split("/")[0];
    const dir = fileType === "image" ? "assets/images" : "assets/audio";
    cb(null, dir); // Указываем папку для файлов
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Расширение файла
    cb(null, Date.now() + ext); // Генерация уникального имени
  },
});

const upload = multer({ storage });

router.post("/upload-image", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Ошибка при загрузке изображения" });
  }
  res.json({ imageUrl: `assets/images/${req.file.filename}` });
});

router.post("/upload-audio", authMiddleware, upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Ошибка при загрузке аудио" });
  }
  res.json({ audioUrl: `assets/audio/${req.file.filename}` });
});
router.get("/my-beats", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Получаем ID пользователя из декодированного токена
        const beats = await Beat.find({ user: userId }).populate("user", "username");
        
        if (!beats || beats.length === 0) {
            return res.status(404).json({ error: "Нет битов для этого пользователя" });
        }

        res.json(beats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});
// Получить все биты с данными пользователя
router.get("/", async (req, res) => {
    try {
        const beats = await Beat.find().populate("user", "username"); // Подтягиваем ник юзера
        res.json(beats);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Получить бит по ID с данными пользователя
router.get("/:id", async (req, res) => {
    try {
        const beat = await Beat.findById(req.params.id).populate("user", "username");
        if (!beat) return res.status(404).json({ error: "Бит не найден" });
        res.json(beat);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Создать новый бит с привязкой к пользователю
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, author, price, description, tags, imageUrl, audioUrl } = req.body;

        const existingUser = await User.findById(userId);
        if (!existingUser) return res.status(404).json({ error: "Пользователь не найден" });

        const newBeat = new Beat({
            title,
            author,
            price,
            description,
            tags,
            imageUrl,
            audioUrl,
            user: userId,
        });

        await newBeat.save();
        res.status(201).json(newBeat);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании бита" });
    }
});


// Обновить бит (если владелец или админ)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const beat = await Beat.findById(req.params.id);
        if (!beat) return res.status(404).json({ error: "Бит не найден" });

        const existingUser = await User.findById(userId);
        if (!existingUser) return res.status(404).json({ error: "Пользователь не найден" });

        const isOwner = beat.user.toString() === userId;
        const isAdmin = existingUser.username === 'admin0';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Нет прав на редактирование" });
        }

        const updatedBeat = await Beat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBeat);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении бита" });
    }
});

// Удалить бит (если владелец или админ)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const beat = await Beat.findById(req.params.id);
        if (!beat) return res.status(404).json({ error: "Бит не найден" });

        const existingUser = await User.findById(userId);
        if (!existingUser) return res.status(404).json({ error: "Пользователь не найден" });

        const isOwner = beat.user.toString() === userId;
        const isAdmin = existingUser.username === 'admin0';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Нет прав на удаление" });
        }

        await Beat.findByIdAndDelete(req.params.id);
        res.json({ message: "Бит удалён" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении бита" });
    }
});
module.exports = router;
