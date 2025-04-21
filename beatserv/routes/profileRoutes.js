const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authenticateToken = require("../auth.js");
const Transaction = require("../models/Transaction");

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

router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) Покупки: где текущий юзер — buyer
    const purchaseTxs = await Transaction
      .find({ buyer: userId })
      .populate("beat", "title imageUrl price")
      .sort({ createdAt: -1 });


    // 2) Продажи: где текущий юзер — seller
    const salesTxs = await Transaction
      .find({ seller: userId })
      .populate("beat", "title imageUrl price")
      .populate("buyer", "username")   // подтянем имя покупателя
      .sort({ createdAt: -1 });


    // Формируем отдачу
    const purchases = purchaseTxs.map(t => ({
      id: t._id,
      beatTitle: t.beat.title,
      beatImage: t.beat.imageUrl,
      amount: t.amount,
      date: t.date,
    }));
    const sales = salesTxs.map(t => ({
      id: t._id,
      beatTitle: t.beat.title,
      beatImage: t.beat.imageUrl,
      buyerUsername: t.buyer.username,
      amount: t.amount,
      date: t.date,
    }));


    res.json({ purchases, sales });
  } catch (err) {
    console.error("Ошибка получения транзакций:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
