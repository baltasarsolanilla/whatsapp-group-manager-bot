import { sendMessage } from "../services/evolutionAPI.js";
import { createTest, getAllTests } from "../db/repositories/testRepository.js";
import { handleGroupMessage } from "./groupLogic.js";
import { handlePersonalMessage } from "./personalLogic.js";

import config from "../config.js";

export async function addNewTest(name) {
  if (!name || name.length < 3) {
    throw new Error("Name too short!");
  }
  return createTest(name);
}

export async function listAllTests() {
  return getAllTests();
}

export const handleUpdate = (update) => {
  if (isGroupMessage(update)) {
    console.log("📢 Received group message:");
    return handleGroupMessage(update);
  }

  if (isPersonalMessage(update)) {
    console.log("👤 Received personal message:");
    return handlePersonalMessage(update);
  }

  // TODO: handle unknown event
  console.log("Handle unknown update:", update);

  return;

  // --------------------------------------------------

  addNewTest(update.data.pushName);

  // ! CAREFUL still using my NUMBER!
  if (false) {
    sendMessage(config.waGroupTest, "Bonjourrr");
  }
};
