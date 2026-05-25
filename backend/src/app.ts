import express from 'express';
import { rootRouter } from './routes/index.js';
import { error } from 'node:console';
import { errorHandlerMiddleware } from './middlewares/error.middleware.js';
import { METHODS } from 'node:http';
import type { CorsOptions } from 'cors';
import cors from 'cors';


export const app = express();

const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'], // Add other headers as needed
    credentials: false, // Set to true if you want to allow/pass cookies or tokens
}

app.use(cors(corsOptions))
app.use(express.json());
app.use('/api/v1' , rootRouter);
app.use(errorHandlerMiddleware);