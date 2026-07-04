const fs = require("fs").promises;
const path = require("path");

/**
 * HÀM ĐÃ SỬA: Tiếp nhận dữ liệu dịch, tự xử lý chèn byte nhị phân và lưu file .dat/.bytes
 * @param {string} folderPath - Đường dẫn thư mục muốn lưu file
 * @param {string} fileName - Tên file gốc (ví dụ: EventText.dat)
 * @param {Array|Uint8Array} originalBuffer - Mảng byte gốc của file nhị phân
 * @param {Array} translations - Mảng các dòng đã dịch từ frontend gửi lên [{ offset, maxLength, translated }]
 */
async function saveFile(folderPath, fileName, originalBuffer, translations) {
    if (!folderPath || !fileName || !originalBuffer || !translations) {
        throw new Error(
            "Dữ liệu đầu vào không hợp lệ: Thiếu đường dẫn, tên file, bộ đệm gốc hoặc danh sách bản dịch.",
        );
    }

    // Tạo bản sao của bộ đệm gốc để thao tác (đảm bảo ở định dạng Buffer của Node.js)
    const outputBuffer = Buffer.from(originalBuffer);
    const encoder = new TextEncoder();

    // Duyệt qua từng dòng dịch để mã hóa và chèn đè nhị phân
    translations.forEach((item) => {
        // Chỉ xử lý những dòng thực sự có nội dung dịch
        if (item.translated && item.translated.trim() !== "") {
            const translatedBytes = encoder.encode(item.translated);
            const maxBytes = item.maxLength;

            // Kiểm tra an toàn một lần nữa tại tầng Service
            if (translatedBytes.length > maxBytes) {
                throw new Error(
                    `Dòng tại offset 0x${item.offset.toString(16).toUpperCase()} vượt quá giới hạn byte cho phép!`,
                );
            }

            // Ghi các byte của chuỗi dịch vào đúng vị trí offset
            for (let i = 0; i < translatedBytes.length; i++) {
                outputBuffer[item.offset + i] = translatedBytes[i];
            }

            // Đệm khoảng trắng (0x20) vào toàn bộ các byte còn thừa để giữ nguyên cấu trúc cấu trúc file
            for (let i = translatedBytes.length; i < maxBytes; i++) {
                outputBuffer[item.offset + i] = 0x00;
            }
        }
    });

    // Lưu file
    const fullPath = path.join(folderPath, fileName);
    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(fullPath, outputBuffer);

    return fullPath;
}

/**
 * HÀM GIỮ NGUYÊN: Lưu file nháp tiến độ dịch dạng JSON (Gồm cả buffer gốc mã hóa base64)
 */
async function saveDraft(folderPath, draftFileName, draftData) {
    if (!folderPath || !draftFileName || !draftData) {
        throw new Error("Thiếu thông tin để tiến hành lưu file nháp.");
    }

    let finalFileName = draftFileName;
    if (!finalFileName.endsWith(".json")) {
        finalFileName += ".json";
    }

    const fullPath = path.join(folderPath, finalFileName);

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
