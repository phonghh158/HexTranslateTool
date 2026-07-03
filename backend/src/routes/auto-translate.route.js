const express = require("express");
const router = express.Router();
const { googleTranslate } = require("../controllers/auto-translate.controller");

// Chỉ cần quy định nhánh con phía sau thôi cậu nhé
router.post("/google", googleTranslate);

module.exports = router;
