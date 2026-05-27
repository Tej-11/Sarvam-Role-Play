import { streamingApiClient } from './client';

interface StreamResponse {
    content: string;
}

export const getOpenAIResponseForChat = async function* (message: string): AsyncGenerator<string> {
    for await (const data of streamingApiClient<StreamResponse>('/openai/chatCompletion', {
        method: "POST",
        body: JSON.stringify({ text: message })
    })) {
        if (data.content) {
            yield data.content;
        }
    }
}
