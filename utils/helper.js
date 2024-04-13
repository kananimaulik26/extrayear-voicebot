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

const openAI = async (request) => {
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
        return response;
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    openAI
}