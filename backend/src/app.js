const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const routes = require("./routes");

const app = express();

// --- BẢO MẬT & GLOBAL MIDDLEWARES ---
// app.use(helmet());

app.use(cors());

// 3. Rate Limit: Chống spam request/DDoS quy mô nhỏ
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 155, // Giới hạn 155 request/15 phút cho mỗi IP
    message: { success: false, message: "Quá nhiều request, vui lòng thử lại sau!" },
});
app.use(limiter);

app.use(express.json({ limit: "55mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../../frontend")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

// --- ROUTES ---
// API Healthcheck kiểm tra trạng thái Server
// app.get("/", (req, res) => {
//     res.status(200).json({
//         status: "success",
//         message: "Server đang chạy rất mượt mà! 🌸",
//     });
// });

app.use("/api", routes);

module.exports = app;
