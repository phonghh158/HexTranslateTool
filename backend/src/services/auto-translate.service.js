const translate = require("google-translate-api-x");

async function googleTranslate(str, sourceLangCode, targetLangCode) {
    if (!str) return "";

    const result = await translate(str, { from: sourceLangCode, to: targetLangCode });

    return result.text;
}

module.exports = { googleTranslate };
