import { Router } from "express";
import { sarvamRouter } from "./sarvam.routes.js";

export const rootRouter = Router();

rootRouter.use('/sarvam', sarvamRouter);
