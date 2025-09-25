// Mock types for Prisma Client to avoid compilation issues during testing
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
