import { openAiClient } from "../config/openai.config.js";

export const openaiChatCompletionService = async (playerResponse: string) => {
    try {
        const stream = await openAiClient.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [{ role: 'user', content: playerResponse }],
            stream: true,
        });
        return stream;
    } catch (error: any) {
        if (error instanceof Error) {
            throw new Error(`Error analyzing text: ${error.message}`);
        } else {
            throw new Error(`Error analyzing text: ${String(error)}`);
        }
    }
}
