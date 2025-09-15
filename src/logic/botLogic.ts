import { saveMessage } from '@database/db';

export const handleUpdate = (update) => {
	// Save incoming message
	saveMessage(update);
	console.log('Handling update from:', update.data.pushName);
};
