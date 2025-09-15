const messages: unknown = []; // Temporary in-memory storage

export const saveMessage = (msg: unknown) => {
	messages.push(msg);
};

export const getMessages = () => messages;
