import express from 'express';
import type { Request, Response } from 'express';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Sample Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Express backend with TypeScript is officially active!" });
});

app.listen(PORT, () => {
  console.log(`⚡ Server is actively listening at http://localhost:${PORT}`);
});
