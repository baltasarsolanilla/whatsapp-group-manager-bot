import { sendMessage } from "@services/evolutionAPI";
import { saveMessage } from "@database/db";
import config from "@config";

export const handleUpdate = (update) => {
  // Save incoming message
  saveMessage(update);
  console.log("Handling update from:", update.data.pushName);

  // ! CAREFUL still using my NUMBER!
  if (false) {
    sendMessage(config.waGroupTest, "Bonjourrr");
  }
};
