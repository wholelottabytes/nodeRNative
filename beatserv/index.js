require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к MongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/beats_platform")
    .then(() => console.log("MongoDB подключена"))
    .catch((err) => console.error("Ошибка подключения к MongoDB", err));

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("success");
});
app.use("/auth", authRoutes);

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
