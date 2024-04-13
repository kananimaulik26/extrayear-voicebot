const { ChatOpenAI } = require("@langchain/openai");
const { ConversationSummaryBufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} = require("@langchain/core/prompts");
const { system_prompt } = require("../utils/prompts");
const { HumanMessage } = require("@langchain/core/messages");
const axios = require("axios");


const chat = async (req, res) => {
    const request = req.body;
    try {
        const chatPromptMemory = new ConversationSummaryBufferMemory({
            llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
            maxTokenLimit: 10,
            returnMessages: true,
        });

        if (request.chat_history && request.chat_history.length > 0) {
            for (const chatItem of request.chat_history) {
                await chatPromptMemory.saveContext(
                    { input: chatItem.input },
                    { output: chatItem.output }
                );
            }
        }

        const chatPrompt = ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(
                system_prompt
            ),
            new MessagesPlaceholder("history"),
            HumanMessagePromptTemplate.fromTemplate("{input}"),
        ]);

        const model = new ChatOpenAI({ temperature: 0.9, verbose: true });
        const chain = new ConversationChain({
            llm: model,
            memory: chatPromptMemory,
            prompt: chatPrompt,
        });

        const response = await chain.invoke({ input: request.input });
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

module.exports = {
    chat,
    chatCompletions,
    textToSpeech
}