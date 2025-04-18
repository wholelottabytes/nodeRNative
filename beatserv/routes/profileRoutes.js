const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authenticateToken = require("../auth.js");

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Получение профиля
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Ошибка получения профиля" });
  }
});

// Обновление фото профиля
router.put("/photo", authenticateToken, upload.single("photo"), async (req, res) => {
  try {
    const userPhoto = `assets/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { userPhoto },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Ошибка обновления фото профиля" });
  }
});

// Обновление/добавление описания
router.put("/description", authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { description },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Ошибка обновления описания" });
  }
});

// Пополнение баланса
router.put("/balance", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Некорректная сумма" });
    }

    const user = await User.findById(req.user.id);
    user.balance = (user.balance || 0) + parseFloat(amount);
    await user.save();

    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: "Ошибка пополнения баланса" });
  }
});

module.exports = router;
