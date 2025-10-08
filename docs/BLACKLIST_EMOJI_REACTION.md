# Blacklist User via 🚫 Emoji Reaction Feature

## Overview

This feature enables group administrators to instantly blacklist users by reacting with the 🚫 emoji to any message in a WhatsApp group. This streamlines moderation by removing the manual step of log-checking for WhatsApp IDs.

## How It Works

### User Workflow

1. **Admin** sees a problematic message from **UserA** in the group
2. **Admin** reacts to **UserA's message** with 🚫 emoji
3. **Bot** detects the reaction via webhook
4. **Bot** verifies the admin status of the reactor
5. **Bot** blacklists **UserA** and removes them from the group
6. **Blacklist** is updated in the database

### Technical Workflow

```
Webhook Event → handleMessageUpsert() → handleReactionMessage()
                                              ↓
                                   Verify bot is admin (database)
                                              ↓
                                   Validate emoji is 🚫
                                              ↓
                                   Verify reactor is admin (database)
                                              ↓
                                   Extract target user from reactionMessage.key.participant
                                              ↓
                                   Call blacklistService.addToBlacklistWithRemoval()
                                              ↓
                                   User is blacklisted and removed from group
```

## Implementation Details

### Webhook Event Structure

The bot listens for `messages.upsert` events with `messageType: 'reactionMessage'`.

Example webhook event:

```json
{
	"event": "messages.upsert",
	"instance": "my-instance",
	"data": {
		"key": {
			"remoteJid": "120363403554080562@g.us",
			"fromMe": false,
			"id": "3A20E439291D7F9C0AC9",
			"participant": "82334925746303@lid"
		},
		"pushName": "Valentina",
		"messageType": "reactionMessage",
		"messageTimestamp": 1759875142,
		"message": {
			"reactionMessage": {
				"key": {
					"id": "3A868C172CED89C71C6B",
					"fromMe": false,
					"remoteJid": "120363403645737238@g.us",
					"participant": "275449187958817@lid"
				},
				"text": "🚫",
				"senderTimestampMs": 1759875191970
			}
		}
	}
}
```

**Key Fields:**

- `data.key.participant` - WhatsApp ID of the admin who reacted
- `data.message.reactionMessage.key.participant` - WhatsApp ID of the user to blacklist
- `data.message.reactionMessage.text` - The emoji used (must be '🚫')

## Code Components

### 1. Type Definitions (`src/types/evolution.d.ts`)

Added `message` property to `MessageUpsert` type:

```typescript
message?: {
  reactionMessage?: {
    key: {
      id: string;
      fromMe: boolean;
      remoteJid: string;
      participant: string;  // Target user to blacklist
    };
    text: string;  // Emoji
    senderTimestampMs: number;
  };
};
```

### 2. Constants (`src/constants/messagesConstants.ts`)

```typescript
export const BLACKLIST_EMOJI = '🚫';
```

### 3. Configuration (`src/config.ts`)

```typescript
botWhatsappId: process.env.BOT_WA_ID;
```

The bot's WhatsApp ID is required to verify it has admin permissions before performing blacklist actions.

### 4. Admin Verification (`src/logic/services/groupMembershipService.ts`)

```typescript
async isUserAdmin(
  userWhatsappId: string,
  groupWhatsappId: string
): Promise<boolean> {
  // Checks MembershipRole.ADMIN from database
}
```

### 5. Main Handler (`src/logic/botLogic.ts`)

The `handleReactionMessage()` function:

1. Verifies bot user is admin (using database membership roles)
2. Validates the emoji is 🚫
3. Verifies the reactor is admin (using database membership roles)
4. Blacklists the target user

## Security Features

- ✅ **Bot Admin Check**: Bot must be admin in the group to perform blacklist actions
- ✅ **Admin-Only**: Only users with ADMIN role can trigger blacklist
- ✅ **Database-Based**: Admin verification uses database membership roles
- ✅ **Group-Scoped**: Only works in group chats
- ✅ **Emoji-Specific**: Only the 🚫 emoji triggers the action
- ✅ **Idempotent**: Uses upsert to prevent duplicate entries
- ✅ **Error Handling**: All errors are caught and logged

## Testing

**File:** `src/logic/botLogic.reactionBlacklist.test.ts`

- ✅ Reaction message webhook structure validation
- ✅ Workflow steps validation
- ✅ Type system support
- ✅ Constant verification

All tests pass (132 total tests).

## Logging Examples

Success:

```
📱 Reaction detected: 🚫 by 82334925746303@lid on message from 275449187958817@lid
🚫 Blacklist emoji detected from 82334925746303@lid
✅ Admin verified: 82334925746303@lid is authorized to blacklist users
🚫 Adding user 275449187958817@lid to blacklist in group 120363403645737238@g.us
✅ Successfully blacklisted user 275449187958817@lid
```

Errors:

```
⚠️  Bot WhatsApp ID (botWhatsappId) not configured
⚠️  Bot user is not an admin in this group, skipping blacklist action
⚠️  User is not an admin, ignoring blacklist reaction
⏭️  Ignoring reaction - not blacklist emoji
❌ Error processing blacklist reaction: <error>
```

## Dependencies

- Group Membership Service (admin verification via database)
- Blacklist Service (blacklist management)
- Group Service (database operations)
- Webhook infrastructure

## Validation Results

✅ TypeScript type check passes  
✅ Build successful  
✅ ESLint passes  
✅ Prettier formatting passes  
✅ All tests passing  
✅ No breaking changes
