import { logging, SarvamAIClient } from "sarvamai";
import { ENV } from "./env.config.js";

export const sarvamClient = new SarvamAIClient({
    apiSubscriptionKey: ENV.SARVAM_API_KEY,
    logging: {
        level: logging.LogLevel.Info,
    }
});