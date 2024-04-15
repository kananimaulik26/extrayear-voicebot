const { ChatOpenAI } = require("@langchain/openai");
const { system_prompt } = require("../utils/prompts");
const { HumanMessage } = require("@langchain/core/messages");
const axios = require("axios");
const { createClient } = require('@deepgram/sdk');
const { openAI } = require("../utils/helper");


const chat = async (req, res) => {
    const request = req.body;
    try {
        const response = await openAI(request)
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const chatCompletions = async (req, res) => {
    try {
        const message = req.body.message;
        if (message) {
            const chat = new ChatOpenAI({
                temperature: 0.9,
                openAIApiKey: process.env.OPENAI_API_KEY,
                streaming: true,
                callbacks: [
                    {
                        handleLLMNewToken(token) {
                            res.write(token);
                        },
                    },
                ],
            });
            await chat.invoke([new HumanMessage(system_prompt + message)]);
            res.end();
        } else {
            res.json({ error: "No message provided" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const textToSpeech = async (req, res) => {
    const inputText = req.body.text;
    try {
        const API_KEY = process.env.ELEVEN_LABS_API_KEY;
        const VOICE_ID = process.env.VOICE_ID;

        const options = {
            method: 'POST',
            url: `${process.env.ELEVEN_LABS_API}/v1/text-to-speech/${VOICE_ID}`,
            headers: {
                accept: 'audio/mpeg',
                'content-type': 'application/json',
                'xi-api-key': `${API_KEY}`,
            },
            data: {
                text: inputText,
            },
            responseType: 'arraybuffer',
        };

        const speechDetails = await axios.request(options);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).send(speechDetails.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const speechToText = async (req, res) => {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    try {
        const audioFile = req.file;
        if (!audioFile) {
            res.status(400).json({ error: 'No audio file uploaded' });
            return;
        }

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            audioFile.buffer,
            {
                model: "nova-2",
                smart_format: true,
            }
        );

        if (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        } else {
            const { response } = await openAI({ input: result.results.channels[0].alternatives[0].transcript })
            res.status(200).json({ response: response });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    chat,
    chatCompletions,
    textToSpeech,
    speechToText
}