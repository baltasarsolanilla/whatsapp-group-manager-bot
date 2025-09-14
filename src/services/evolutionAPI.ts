import axios from "axios";
import config from "../config";

const BASE_URL = config.evolutionApiUrl;
const API_KEY = config.evolutionApiKey;
const INSTANCE = config.instance;

export const sendMessage = async (to, message) => {
  try {
    await axios.post(
      `${BASE_URL}/message/sendText/${INSTANCE}`,
      {
        number: to,
        text: message,
      },
      {
        headers: {
          apikey: API_KEY,
        },
      }
    );
    console.log("Message sent:", message);
  } catch (err) {
    console.error("Failed to send message:", err.message);
  }
};
