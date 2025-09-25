declare module '@prisma/client' {
	export interface User {
		id: string;
		whatsappId: string;
		whatsappPn?: string | null;
		name?: string | null;
		createdAt: Date;
	}

	export interface Group {
		id: string;
		whatsappId: string;
		name?: string | null;
		inactivityThresholdMinutes: number;
		createdAt: Date;
	}

	export interface Blacklist {
		id: string;
		userId: string;
		groupId: string;
		createdAt: Date;
	}

	export interface Whitelist {
		id: string;
		userId: string;
		groupId: string;
		createdAt: Date;
	}

	export interface GroupMembership {
		id: string;
		userId: string;
		groupId: string;
		joinDate: Date;
		lastActiveAt?: Date | null;
		createdAt: Date;
	}

	export interface RemovalQueue {
		id: string;
		userId: string;
		groupId: string;
		createdAt: Date;
	}

	export interface Message {
		id: string;
		whatsappId: string;
		userId: string;
		groupId: string;
		messageType: string;
		date: Date;
		createdAt: Date;
	}

	export enum RemovalOutcome {
		SUCCESS = 'SUCCESS',
		FAILURE = 'FAILURE',
	}

	export interface RemovalHistory {
		id: string;
		userId: string;
		groupId: string;
		outcome: RemovalOutcome;
		reason?: string | null;
		processedAt: Date;
	}

	export interface WebhookEvent {
		id: string;
		event: string;
		instance: string;
		data: any;
		createdAt: Date;
	}

	export namespace Prisma {
		export interface WebhookEventCreateInput {
			event: string;
			instance: string;
			data: any;
			createdAt?: Date;
		}
	}

	export class PrismaClient {
		blacklist: {
			upsert: (args: any) => Promise<Blacklist>;
			findMany: (args?: any) => Promise<Blacklist[]>;
			deleteMany: (args: any) => Promise<{ count: number }>;
		};
		group: {
			upsert: (args: any) => Promise<Group>;
			findUnique: (args: any) => Promise<Group | null>;
			update: (args: any) => Promise<Group>;
		};
		user: {
			upsert: (args: any) => Promise<User>;
			findUnique: (args: any) => Promise<User | null>;
		};
		whitelist: {
			upsert: (args: any) => Promise<Whitelist>;
			findMany: (args?: any) => Promise<Whitelist[]>;
			findUnique: (args: any) => Promise<any>;
			deleteMany: (args: any) => Promise<{ count: number }>;
		};
		removalQueue: {
			upsert: (args: any) => Promise<RemovalQueue>;
			delete: (args: any) => Promise<RemovalQueue>;
			findMany: (args?: any) => Promise<any[]>;
		};
		groupMembership: {
			upsert: (args: any) => Promise<GroupMembership>;
			findMany: (args?: any) => Promise<any[]>;
			delete: (args: any) => Promise<GroupMembership>;
		};
		message: {
			upsert: (args: any) => Promise<Message>;
		};
		removalHistory: {
			create: (args: any) => Promise<RemovalHistory>;
		};
		webhookEvent: {
			create: (args: any) => Promise<WebhookEvent>;
		};
	}
}
