import { Router } from "express";
import { openAIChatCompletionController } from "../controllers/openai.controller.js";

export const openAiRouter = Router();

openAiRouter.route('/chatCompletion')
    .post(openAIChatCompletionController);