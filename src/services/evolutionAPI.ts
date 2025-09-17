import config from '@config';
import { createGroupService } from './groupService';
import { createMessageService } from './messageService';

export type API_CONFIG_TYPE = {
	BASE_URL?: string;
	API_KEY?: string;
	INSTANCE?: string;
};

const API_CONFIG: API_CONFIG_TYPE = {
	BASE_URL: config.evolutionApiUrl,
	API_KEY: config.evolutionApiKey,
	INSTANCE: config.instance,
};

export const evolutionAPI = {
	groupService: createGroupService(API_CONFIG),
	messageService: createMessageService(API_CONFIG),
};
