# Admin Membership Management

This document describes the admin membership management features added to the WhatsApp Group Manager Bot.

## Overview

The system now supports role-based membership with two roles:

- **MEMBER** (default): Regular group member
- **ADMIN**: Group administrator with elevated privileges

## Database Schema

### MembershipRole Enum

```prisma
enum MembershipRole {
  MEMBER
  ADMIN
}
```

### GroupMembership Model

The `GroupMembership` model now includes a `role` field:

- Type: `MembershipRole`
- Default: `MEMBER`
- This ensures backwards compatibility for existing memberships

## API Endpoints

### Update Member Role

**Endpoint:** `PATCH /admin/members/role`

Updates the role of a member in a group.

**Request Body:**

```json
{
	"userWhatsappId": "123456789@s.whatsapp.net",
	"groupWhatsappId": "987654321@g.us",
	"role": "ADMIN"
}
```

**Response:**

```json
{
	"message": "Member role updated successfully",
	"membership": {
		"id": "...",
		"userId": "...",
		"groupId": "...",
		"role": "ADMIN",
		"joinDate": "...",
		"lastActiveAt": "...",
		"createdAt": "..."
	}
}
```

**Validation:**

- `userWhatsappId` is required
- `groupWhatsappId` is required
- `role` is required and must be either "ADMIN" or "MEMBER"
- User, group, and membership must exist

### Get Membership

**Endpoint:** `GET /admin/members`

Retrieves membership details including the role.

**Query Parameters:**

- `userWhatsappId`: WhatsApp user ID (optional when role is specified)
- `groupWhatsappId`: WhatsApp group ID (required)
- `role`: Filter by role - "ADMIN" or "MEMBER" (optional)

**Example 1: Get a specific user's membership**

```
GET /admin/members?userWhatsappId=123456789@s.whatsapp.net&groupWhatsappId=987654321@g.us
```

**Response:**

```json
{
	"id": "...",
	"userId": "...",
	"groupId": "...",
	"role": "ADMIN",
	"joinDate": "...",
	"lastActiveAt": "...",
	"createdAt": "...",
	"user": {
		"id": "...",
		"whatsappId": "123456789@s.whatsapp.net",
		"name": "John Doe"
	},
	"group": {
		"id": "...",
		"whatsappId": "987654321@g.us",
		"name": "Test Group"
	}
}
```

**Example 2: Get all admin members in a group**

```
GET /admin/members?groupWhatsappId=987654321@g.us&role=ADMIN
```

**Response:**

```json
[
	{
		"id": "...",
		"userId": "...",
		"groupId": "...",
		"role": "ADMIN",
		"joinDate": "...",
		"lastActiveAt": "...",
		"createdAt": "...",
		"user": {
			"id": "...",
			"whatsappId": "123456789@s.whatsapp.net",
			"name": "John Doe"
		},
		"group": {
			"id": "...",
			"whatsappId": "987654321@g.us",
			"name": "Test Group"
		}
	},
	{
		"id": "...",
		"userId": "...",
		"groupId": "...",
		"role": "ADMIN",
		"joinDate": "...",
		"lastActiveAt": "...",
		"createdAt": "...",
		"user": {
			"id": "...",
			"whatsappId": "987654321@s.whatsapp.net",
			"name": "Jane Smith"
		},
		"group": {
			"id": "...",
			"whatsappId": "987654321@g.us",
			"name": "Test Group"
		}
	}
]
```

**Example 3: Get all regular members in a group**

```
GET /admin/members?groupWhatsappId=987654321@g.us&role=MEMBER
```

## Utility Functions

### isUserAdmin()

**Location:** `src/logic/services/groupMembershipService.ts`

Checks if a user is an admin in a specified group.

**Function Signature:**

```typescript
groupMembershipService.isUserAdmin(
	userWhatsappId: string,
	groupWhatsappId: string
): Promise<boolean>;
```

**Example Usage:**

```typescript
import { groupMembershipService } from '@logic/services/groupMembershipService';

const isAdmin = await groupMembershipService.isUserAdmin(
	'123456789@s.whatsapp.net',
	'987654321@g.us'
);

if (isAdmin) {
	// Allow privileged action
} else {
	// Deny action
}
```

**Return Values:**

- `true`: User is an admin in the group
- `false`: User is not an admin, or user/group/membership doesn't exist

## Service Layer

### groupMembershipService

**Location:** `src/logic/services/groupMembershipService.ts`

Provides business logic for group membership management.

**Methods:**

#### isUserAdmin()

```typescript
await groupMembershipService.isUserAdmin(
	'123456789@s.whatsapp.net',
	'987654321@g.us'
);
```

#### updateMemberRole()

```typescript
await groupMembershipService.updateMemberRole({
	userWhatsappId: '123456789@s.whatsapp.net',
	groupWhatsappId: '987654321@g.us',
	role: 'ADMIN',
});
```

#### getMembership()

```typescript
const membership = await groupMembershipService.getMembership({
	userWhatsappId: '123456789@s.whatsapp.net',
	groupWhatsappId: '987654321@g.us',
});
```

#### getMembersByRole()

```typescript
const admins = await groupMembershipService.getMembersByRole({
	groupWhatsappId: '987654321@g.us',
	role: 'ADMIN',
});
```

## Repository Layer

### groupMembershipRepository

**Location:** `src/database/repositories/groupMembershipRepository.ts`

New methods added:

#### updateRole()

```typescript
await groupMembershipRepository.updateRole({
	userId: 'internal-user-id',
	groupId: 'internal-group-id',
	role: 'ADMIN',
});
```

#### getByUserAndGroup()

```typescript
const membership = await groupMembershipRepository.getByUserAndGroup({
	userId: 'internal-user-id',
	groupId: 'internal-group-id',
});
```

#### listByGroupIdAndRole()

```typescript
const admins = await groupMembershipRepository.listByGroupIdAndRole(
	'internal-group-id',
	'ADMIN'
);
```

## Migration

The database migration is located at:

```
prisma/migrations/20251007224352_add_membership_role/migration.sql
```

It performs the following:

1. Creates the `MembershipRole` enum with values MEMBER and ADMIN
2. Adds the `role` column to the `group_memberships` table with a default value of MEMBER

This ensures all existing memberships are automatically assigned the MEMBER role.

## Testing

Comprehensive tests are included for all components:

- `src/logic/services/groupMembershipService.test.ts` - Tests for the service layer including isUserAdmin
- `src/routes/groupMembershipController.test.ts` - Tests for the controller layer

All tests follow the existing structural validation pattern used in the codebase.

## Usage Examples

### Example 1: Promote a User to Admin

```bash
curl -X PATCH http://localhost:3000/admin/members/role \
  -H "Content-Type: application/json" \
  -d '{
    "userWhatsappId": "123456789@s.whatsapp.net",
    "groupWhatsappId": "987654321@g.us",
    "role": "ADMIN"
  }'
```

### Example 2: Demote an Admin to Member

```bash
curl -X PATCH http://localhost:3000/admin/members/role \
  -H "Content-Type: application/json" \
  -d '{
    "userWhatsappId": "123456789@s.whatsapp.net",
    "groupWhatsappId": "987654321@g.us",
    "role": "MEMBER"
  }'
```

### Example 3: Check Membership Role

```bash
curl -X GET "http://localhost:3000/admin/members?userWhatsappId=123456789@s.whatsapp.net&groupWhatsappId=987654321@g.us"
```

### Example 4: Get All Admin Members

```bash
curl -X GET "http://localhost:3000/admin/members?groupWhatsappId=987654321@g.us&role=ADMIN"
```

### Example 5: Get All Regular Members

```bash
curl -X GET "http://localhost:3000/admin/members?groupWhatsappId=987654321@g.us&role=MEMBER"
```

### Example 6: Using isUserAdmin in Code

```typescript
import { groupMembershipService } from '@logic/services/groupMembershipService';

async function handlePrivilegedAction(userWaId: string, groupWaId: string) {
	const isAdmin = await groupMembershipService.isUserAdmin(userWaId, groupWaId);

	if (!isAdmin) {
		throw new Error('Only admins can perform this action');
	}

	// Proceed with privileged action
	console.log('User is admin, proceeding...');
}
```

## Future Enhancements

This feature provides the foundation for:

- Admin-only removal actions
- Admin-only whitelist/blacklist management
- Admin-specific commands in WhatsApp
- Role-based permissions system
- Audit trails for admin actions
