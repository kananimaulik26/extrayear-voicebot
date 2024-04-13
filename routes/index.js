const express = require("express");
const { chat, chatCompletions, textToSpeech } = require("../controller");
const router = express.Router();

router.post("/chat", chat);
router.post("/chat-completions", chatCompletions);
router.post("/text-to-speech", textToSpeech);

module.exports = router;