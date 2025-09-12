import { handleUpdate } from "../logic/botLogic.js";

export const handleWebhook = (req, res) => {
  const update = req.body;
  console.log("==========================================");
  // console.log("Event: ", update.event);
  console.log("Received update:", update);

  // Pass the update to the logic layer
  handleUpdate(update);

  res.sendStatus(200);
};
