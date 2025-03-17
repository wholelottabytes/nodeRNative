const express = require("express");
const Beat = require("../models/Beat");
const User = require("../models/User"); // Добавили импорт User
const router = express.Router();

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
router.post("/", async (req, res) => {
    try {
        const { title, author, price, description, tags, imageUrl, audioUrl, user } = req.body;

        // Проверяем, существует ли пользователь
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        const newBeat = new Beat({ title, author, price, description, tags, imageUrl, audioUrl, user });
        await newBeat.save();
        res.status(201).json(newBeat);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при создании бита" });
    }
});

// Обновить бит (только если юзер совпадает)
router.put("/:id", async (req, res) => {
    try {
        const { user } = req.body; // Получаем ID юзера из запроса
        const beat = await Beat.findById(req.params.id);

        if (!beat) return res.status(404).json({ error: "Бит не найден" });

        if (beat.user.toString() !== user) {
            return res.status(403).json({ error: "Нет прав на редактирование" });
        }

        const updatedBeat = await Beat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBeat);
    } catch (error) {
        res.status(500).json({ error: "Ошибка при обновлении бита" });
    }
});

// Удалить бит (только если юзер совпадает)
router.delete("/:id", async (req, res) => {
    try {
        const { user } = req.body;
        const beat = await Beat.findById(req.params.id);

        if (!beat) return res.status(404).json({ error: "Бит не найден" });

        if (beat.user.toString() !== user) {
            return res.status(403).json({ error: "Нет прав на удаление" });
        }

        await Beat.findByIdAndDelete(req.params.id);
        res.json({ message: "Бит удалён" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при удалении бита" });
    }
});

module.exports = router;
