import express from "express";
import dotenv from "dotenv";
import webhookRoutes from "./webhook/webhook.routes.js";
import config from "./config.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/", webhookRoutes);

const PORT = config.port || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
