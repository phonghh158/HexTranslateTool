const { success, error } = require("../utils/response");
const saveService = require("../services/save.service");

// Hàm xử lý yêu cầu đóng gói và lưu file binary (.dat)
async function saveFile(req, res) {
    try {
        const { folderPath, fileName, originalBuffer, translations } = req.body;

        const savedPath = await saveService.saveFile(
            folderPath,
            fileName,
            originalBuffer,
            translations,
        );

        return success(res, { savedPath }, "Đóng gói và lưu file thành công!", 200);
    } catch (err) {
        console.error("[LỖI SAVE FILE]", err);
        return error(res, err.message, 500, err);
    }
}

// Hàm xử lý yêu cầu lưu file nháp tiến độ (.json)
async function saveDraft(req, res) {
    try {
        const { folderPath, draftFileName, draftData } = req.body;

        const savedPath = await saveService.saveDraft(folderPath, draftFileName, draftData);

        return success(res, { savedPath }, "Lưu tiến độ nháp thành công!", 200);
    } catch (err) {
        console.error("[LỖI SAVE DRAFT]", err);
        return error(res, err.message, 500, err);
    }
}

module.exports = {
    saveFile,
    saveDraft,
};
