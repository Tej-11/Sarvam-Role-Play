import { getOpenAIResponseForChat } from "../api/openaaiApi";

export const getOpenAIResponse = async function* (message: string): AsyncGenerator<string> {
    for await (const chunk of getOpenAIResponseForChat(message)) {
        yield chunk;
    }
}
