require("dotenv").config();
const app = require("./src/app");
const { exec } = require("child_process");

const APP_NAME = process.env.APP_NAME || "Doraemon Studio";
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`🚀 App Name    : ${APP_NAME}`);
    console.log(`🔌 Server Port : http://localhost:${PORT}`);

    // Ra lệnh cho Windows tự động mở trình duyệt mặc định
    exec(`start http://localhost:${PORT}`);
});
