import { sendMessage } from "../services/evolutionAPI.js";
import { saveMessage } from "../database/db.js";
import config from "../config.js";

export const handleUpdate = (update) => {
  // Save incoming message
  saveMessage(update);
  console.log("Handling update from:", update.data.pushName);

  // ! CAREFUL still using my NUMBER!
  if (false) {
    sendMessage(config.waGroupTest, "Bonjourrr");
  }
};
