const express = require("express");
const router = express.Router();
const { saveFile, saveDraft } = require("../controllers/save.controller");

router.post("/file", saveFile);
router.post("/draft", saveDraft);

module.exports = router;