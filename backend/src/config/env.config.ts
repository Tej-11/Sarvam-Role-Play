import dotenv from 'dotenv';

dotenv.config();

if(!process.env.SARVAM_API_KEY) {
    throw new Error("Missing environment variable: SARVAM_API_KEY");
}

export const ENV = {
    PORT: process.env.PORT || 4000,
    SARVAM_API_KEY: process.env.SARVAM_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
}