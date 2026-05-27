// Importing at the top of the file to ensure that environment variables are loaded before any other modules are imported
import { ENV } from "./config/env.config.js";
import app from "./app.js";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`⚡ Server is actively listening at http://localhost:${PORT}`);
});
