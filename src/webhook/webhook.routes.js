import express from "express";
import { handleWebhook } from "./webhook.controller.js";

const router = express.Router();

router.post("/", handleWebhook);

export default router;
