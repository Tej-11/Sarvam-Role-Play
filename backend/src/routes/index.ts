import { Router } from "express";
import { sarvamRouter } from "./sarvam.routes.js";
import { openAiRouter } from "./openai.routes.js";

export const rootRouter = Router();

rootRouter.use('/sarvam', sarvamRouter);
rootRouter.use('/openai', openAiRouter);
