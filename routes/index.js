const express = require("express");
const { chat, chatCompletions, textToSpeech, speechToText } = require("../controller");
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post("/chat", chat);
router.post("/chat-completions", chatCompletions);
router.post("/text-to-speech", textToSpeech);
router.post('/speech-to-text', upload.single('audio'), speechToText);



module.exports = router;