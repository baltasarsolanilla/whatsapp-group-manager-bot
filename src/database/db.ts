const messages: string[] = []; // Temporary in-memory storage

export const saveMessage = (msg: string) => {
	messages.push(msg);
};

export const getMessages = () => messages;
