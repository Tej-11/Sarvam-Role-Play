import { OpenAI } from "openai/client.js";
import { ENV } from "./env.config.js";

export const openAiClient = new OpenAI({
    apiKey: ENV.OPENAI_API_KEY, 
}); 