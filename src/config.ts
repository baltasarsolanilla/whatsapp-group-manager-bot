import dotenv from 'dotenv';

dotenv.config();

export default {
	port: process.env.PORT,
	evolutionApiUrl: process.env.EVOLUTION_API_URL,
	evolutionApiKey: process.env.EVOLUTION_API_KEY,
	instance: process.env.EVOLUTION_INSTANCE_NAME,

	// WhatsApp constants
	waVickyNum: process.env.WA_VICKY_NUM,
	waVickyId: process.env.WA_VICKY_ID,
	waGroupTest: process.env.WA_GROUP_TEST,
};
