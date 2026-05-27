import { openaiChatCompletionService } from "../services/openai.services.js";

export const openAIChatCompletionController = async (req: any, res: any, next: any) => {
    try {
        const playerResponse = req.body.text;
        if (!playerResponse) {
            return res.status(400).json({ error: 'No text provided' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await openaiChatCompletionService(playerResponse);

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.end();
    } catch (error) {
        next(error);
    }
};