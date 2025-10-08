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
                                   Validate emoji is 🚫
                                              ↓
                                   Fetch group data from Evolution API
                                              ↓
                                   Verify reactor is admin
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

### 3. Helper Functions (`src/logic/helpers.ts`)

```typescript
export const isUserAdmin = (
	whatsappId: string,
	groupData: GroupData
): boolean => {
	const participant = groupData.participants.find((p) => p.id === whatsappId);
	if (!participant) return false;
	return participant.admin === 'admin' || participant.admin === 'superadmin';
};
```

### 4. Main Handler (`src/logic/botLogic.ts`)

The `handleReactionMessage()` function:

1. Validates the emoji is 🚫
2. Fetches group data from Evolution API
3. Verifies the reactor is an admin
4. Blacklists the target user

## Security Features

- ✅ **Admin-Only**: Only users with 'admin' or 'superadmin' role can trigger blacklist
- ✅ **Group-Scoped**: Only works in group chats
- ✅ **Emoji-Specific**: Only the 🚫 emoji triggers the action
- ✅ **Idempotent**: Uses upsert to prevent duplicate entries
- ✅ **Error Handling**: All errors are caught and logged

## Testing

**File:** `src/logic/botLogic.reactionBlacklist.test.ts`

- ✅ Admin verification with `isUserAdmin()`
- ✅ Reaction message webhook structure validation
- ✅ Workflow steps validation
- ✅ Type system support
- ✅ Constant verification

All 104 tests pass (5 new tests added).

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
⚠️  User is not an admin, ignoring blacklist reaction
⚠️  Could not fetch group data, skipping blacklist action
⏭️  Ignoring reaction - not blacklist emoji
❌ Error processing blacklist reaction: <error>
```

## Dependencies

- Evolution API (group data & admin info)
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
