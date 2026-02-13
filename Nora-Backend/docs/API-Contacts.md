# Contacts API

Base path: `/contacts`

All requests/responses use `Content-Type: application/json`.

---

## GET /contacts

List all contacts.

### Request
```
GET /contacts
```

### Response (200 OK)
```json
{
  "contacts": [
    {
      "id": "c-1",
      "name": "John Smith",
      "email": "john.smith@abccorp.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Business Ave, Toronto, ON M5V 2T6"
    },
    {
      "id": "c-2",
      "name": "Sarah Johnson",
      "email": "sarah.j@xyzltd.com",
      "phone": "+1 (555) 234-5678",
      "address": "456 Commerce St, Vancouver, BC V6B 1A1"
    }
  ]
}
```

---

## POST /contacts

Create a new contact. Backend auto-generates `id` (e.g. `c-1739123456789`).

### Request
```
POST /contacts
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 (555) 999-0000",
  "address": "100 Main St, Toronto, ON"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | |
| email | string | yes | |
| phone | string | no | |
| address | string | no | |

### Response (201 Created)
```json
{
  "contacts": [
    {
      "id": "c-1739123456789",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 (555) 999-0000",
      "address": "100 Main St, Toronto, ON"
    }
  ]
}
```

---

## PUT /contacts

Update an existing contact. Body must include `id`.

### Request
```
PUT /contacts
Content-Type: application/json
```

**Body:**
```json
{
  "id": "c-1",
  "name": "John Smith Updated",
  "email": "john.updated@abccorp.com",
  "phone": "+1 (555) 111-2222",
  "address": "999 New Address, Toronto, ON"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Contact ID to update |
| name | string | no | |
| email | string | no | |
| phone | string | no | |
| address | string | no | |

### Response (200 OK)
```json
{
  "contacts": [
    {
      "id": "c-1",
      "name": "John Smith Updated",
      "email": "john.updated@abccorp.com",
      "phone": "+1 (555) 111-2222",
      "address": "999 New Address, Toronto, ON"
    }
  ]
}
```

### Error (404 Not Found)
```json
{
  "error": "Contact not found"
}
```

---

## DELETE /contacts?id=&lt;id&gt;

Delete a contact.

### Request
```
DELETE /contacts?id=c-1
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Contact ID to delete |

### Response (200 OK)
```json
{
  "contacts": [
    {
      "id": "c-1",
      "name": "John Smith",
      "email": "john.smith@abccorp.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Business Ave, Toronto, ON M5V 2T6"
    }
  ]
}
```
_(Returns the deleted contact)_

### Error (400 Bad Request)
```json
{
  "error": "Missing id"
}
```

### Error (404 Not Found)
```json
{
  "error": "Contact not found"
}
```
