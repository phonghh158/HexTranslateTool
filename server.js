const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const translate = require("google-translate-api-x");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname));

// Khởi tạo Gemini AI
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// API Dịch bằng Gemini
app.post("/api/translate/gemini", async (req, res) => {
    // Nhận thêm tên ngôn ngữ từ Frontend
    const { text, sourceLangName, targetLangName } = req.body;
    try {
        if (!text) return res.json({ success: true, translatedText: "" });

        // Tự động điền ngôn ngữ vào Prompt
        const promptText = `
            Dịch câu thoại từ ${sourceLangName} sang ${targetLangName}.
            Ngữ cảnh: Game Doraemon Story of Seasons. Nhân vật là Doraemon, Nobita, Shizuka, Suneo, Jaian và những người bạn mới ở trong game.
            Ngôi xưng: Cậu - tớ.
            Văn phong: Dễ thương, nhẹ nhàng, phù hợp với lứa tuổi thiếu nhi, gần gũi như xem phim hoạt hình Doraemon.
            Lưu ý quan trọng: 
            - Giữ nguyên các định dạng đặc biệt hoặc ký tự xuống dòng.
            - Không thêm các câu cảm thán quá dài nếu câu gốc ngắn.
            - Dịch thoát ý, không dịch sát nghĩa đen từng từ.
            - Trả về CHỈ kết quả bản dịch, không giải thích.
            Câu thoại gốc: "${text}"
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-3.5-flash",
            contents: promptText,
        });

        res.json({ success: true, translatedText: response.text.trim().replace(/^"|"$/g, "") });
    } catch (error) {
        console.error("[LỖI GEMINI]", error);
        res.status(500).json({ success: false, message: "Lỗi API Gemini" });
    }
});

// API Dịch bằng Google Translate
app.post("/api/translate/google", async (req, res) => {
    // Nhận thêm mã ngôn ngữ từ Frontend (ví dụ: 'th' và 'vi')
    const { text, sourceLangCode, targetLangCode } = req.body;
    try {
        if (!text) return res.json({ success: true, translatedText: "" });

        // Truyền mã ngôn ngữ động vào thư viện
        const resTranslate = await translate(text, {
            from: sourceLangCode,
            to: targetLangCode,
        });

        res.json({ success: true, translatedText: resTranslate.text });
    } catch (error) {
        console.error("[LỖI GOOGLE]", error);
        res.status(500).json({ success: false, message: "Lỗi API Google" });
    }
});

// API Đóng gói file
app.post("/api/save", (req, res) => {
    const { folderPath, fileName, bufferData } = req.body;
    try {
        if (!folderPath || !fileName)
            return res
                .status(400)
                .json({ success: false, message: "Thiếu đường dẫn hoặc tên file." });

        const fullPath = path.join(folderPath, fileName);
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

        fs.writeFileSync(fullPath, Buffer.from(bufferData));
        res.json({ success: true, message: "Lưu thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌸 MÁY CHỦ DORAEMON STUDIO ĐÃ KHỞI ĐỘNG CÔNG CỤ`);
    console.log(`👉 Mở link: http://localhost:${PORT}`);
});
