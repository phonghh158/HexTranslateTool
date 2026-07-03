const express = require("express");
const router = express.Router();

const translateRoute = require("./auto-translate.route");
const saveRoute = require("./save.route");

// Auto Translate Routes
router.use("/translate", translateRoute);
route.use("/save", saveRoute);

module.exports = router;
