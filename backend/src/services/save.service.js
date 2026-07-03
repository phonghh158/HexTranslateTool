const fs = require("fs").promises;
const path = require("path");

/**
 * Hàm lưu file Binary gốc (Hàm cũ cậu đã tối ưu)
 */
async function saveFile(folderPath, fileName, bufferData) {
    if (!folderPath || !fileName || !bufferData) {
        throw new Error(
            "Dữ liệu đầu vào không hợp lệ: Thiếu đường dẫn, tên file hoặc nội dung.",
        );
    }
    const fullPath = path.join(folderPath, fileName);
    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(fullPath, Buffer.from(bufferData));
    return fullPath;
}

/**
 * HÀM MỚI: Lưu file nháp tiến độ dịch dạng JSON
 * @param {string} folderPath - Đường dẫn thư mục lưu file nháp
 * @param {string} draftFileName - Tên file nháp (ví dụ: nhap_chuong_1.json)
 * @param {Object} draftData - Object chứa originalFileName, text đã dịch và originalBuffer
 */
async function saveDraft(folderPath, draftFileName, draftData) {
    if (!folderPath || !draftFileName || !draftData) {
        throw new Error("Thiếu thông tin để tiến hành lưu file nháp.");
    }

    // Tự động thêm đuôi .json nếu không nhập
    let finalFileName = draftFileName;
    if (!finalFileName.endsWith(".json")) {
        finalFileName += ".json";
    }

    const fullPath = path.join(folderPath, finalFileName);

    // Tạo cấu hình dữ liệu lưu xuống file JSON
    const payload = {
        originalFileName: draftData.originalFileName,
        sourceLangCode: draftData.sourceLangCode,
        targetLangCode: draftData.targetLangCode,
        savedAt: new Date().toISOString(),
        originalBufferBase64: Buffer.from(draftData.originalBuffer).toString("base64"),
        data: draftData.data,
    };

    await fs.mkdir(folderPath, { recursive: true });

    const jsonString = JSON.stringify(payload, null, 2);

    await fs.writeFile(fullPath, jsonString, "utf8");

    return fullPath;
}

module.exports = {
    saveFile,
    saveDraft,
};
