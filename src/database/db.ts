const messages = []; // Temporary in-memory storage

export const saveMessage = (msg) => {
  messages.push(msg);
  console.log("Message saved to DB (mock):", msg);
};

export const getMessages = () => messages;
