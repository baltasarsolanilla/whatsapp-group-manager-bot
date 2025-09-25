import dotenv from 'dotenv';
import fs from 'fs';

const envFile =
	process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

if (fs.existsSync(envFile)) {
	dotenv.config({ path: envFile });
	console.log(`✅ Env file ${envFile} loaded`);
} else {
	console.warn(`⚠️ Env file ${envFile} not found`);
}

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
