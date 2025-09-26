# Blacklist Auto-Removal API

## Enhanced Blacklist Endpoint

The blacklist endpoint has been enhanced to automatically remove users from WhatsApp groups when they are added to the blacklist.

### Endpoint
```
POST /admin/lists/blacklist
```

### Request Body
```json
{
  "phoneNumber": "string", // required - phone number (e.g., "+1234567890")
  "groupId": "string",     // required - WhatsApp group ID
  "reason": "string",      // optional - reason for blacklisting
  "skipRemoval": boolean   // optional - if true, skips automatic removal (default: false)
}
```

### Response

#### Success Response (with auto-removal)
```json
{
  "message": "Added to blacklist",
  "blacklistEntry": {
    "userId": "user123",
    "groupId": "group123"
  },
  "removalResults": {
    "success": true,
    "groupWaId": "group123@g.us"
  },
  "skipRemoval": false,
  "reason": "Spam user"
}
```

#### Success Response (with skipRemoval=true)
```json
{
  "message": "Added to blacklist",
  "blacklistEntry": {
    "userId": "user123",
    "groupId": "group123"
  },
  "removalResults": {
    "success": true,
    "groupWaId": "group123@g.us"
  },
  "skipRemoval": true,
  "reason": "Spam user"
}
```

#### Success Response (blacklist added, removal failed - non-blocking)
```json
{
  "message": "Added to blacklist",
  "blacklistEntry": {
    "userId": "user123",
    "groupId": "group123"
  },
  "removalResults": {
    "success": false,
    "error": "Failed to remove user from WhatsApp group",
    "groupWaId": "group123@g.us"
  },
  "skipRemoval": false,
  "reason": "Spam user"
}
```

#### Error Response
```json
{
  "error": "Group or user not found"
}
```

### Key Features

1. **Non-blocking Operation**: Blacklist addition succeeds even if WhatsApp group removal fails
2. **Comprehensive Response**: Returns both blacklist entry details and removal results
3. **Optional Skip Parameter**: Use `skipRemoval: true` to bypass automatic removal
4. **Backward Compatibility**: Works with existing requests that don't include `skipRemoval`
5. **Error Handling**: Graceful handling of WhatsApp API failures

### Usage Examples

#### Add to blacklist with automatic removal
```bash
curl -X POST /admin/lists/blacklist \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "groupId": "group123@g.us",
    "reason": "Spam user"
  }'
```

#### Add to blacklist without removal
```bash
curl -X POST /admin/lists/blacklist \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "groupId": "group123@g.us",
    "reason": "Spam user",
    "skipRemoval": true
  }'
```

### Implementation Details

- Uses existing `evolutionAPI.groupService.removeMembers()` for WhatsApp integration
- Database operations are performed first to ensure data consistency
- WhatsApp removal failures are logged but don't prevent blacklist addition
- Maintains full backward compatibility with existing blacklist functionality