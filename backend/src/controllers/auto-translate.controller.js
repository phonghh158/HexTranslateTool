const { success, error } = require("../utils/response");
const autoTranslateService = require("../services/auto-translate.service");

async function googleTranslate(req, res) {
    try {
        const { str, sourceLangCode, targetLangCode } = req.body;
        const result = await autoTranslateService.googleTranslate(str, sourceLangCode, targetLangCode);
        return success(res, result, "Thành công", 200);
    } catch (error) {
        console.error("[LỖI GOOGLE]", error);
        return error(res, error.message, 500, error);
    }
}

module.exports = { googleTranslate };
