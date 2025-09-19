# API Documentation

## Base URL

Development: `http://localhost:3001`
Production: `https://your-backend-domain.com`

## Authentication

All endpoints except `/health`, `/api/auth/login`, and `/api/auth/register` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,      // Present on successful requests
  "message": string, // Optional success message
  "error": string,   // Present on failed requests
  "pagination": {    // Present on paginated responses
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## Authentication Endpoints

### POST /api/auth/login

Login user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "operator",
      "active": true
    },
    "token": "jwt-token-here"
  }
}
```

### POST /api/auth/register

Register new user (Admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "operator"
}
```

### GET /api/auth/profile

Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "operator",
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/auth/profile

Update user profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### PUT /api/auth/change-password

Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

## Transaction Endpoints

### POST /api/transactions

Create new ACH transaction.

**Request Body:**
```json
{
  "drRoutingNumber": "123456789",
  "drAccountNumber": "1234567890",
  "drId": "CUSTOMER001",
  "drName": "John Customer",
  "crRoutingNumber": "987654321",
  "crAccountNumber": "0987654321",
  "crId": "VENDOR001",
  "crName": "ABC Company",
  "amount": 1500.00,
  "effectiveDate": "2023-12-15",
  "senderDetails": "Monthly payment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "drRoutingNumber": "123456789",
    "drAccountNumber": "****7890",
    "amount": 1500.00,
    "status": "pending",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET /api/transactions

List transactions with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)
- `status` (string): Filter by status (pending, processed, failed, cancelled)
- `effectiveDate` (string): Filter by effective date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "drRoutingNumber": "123456789",
      "drAccountNumber": "****7890",
      "amount": 1500.00,
      "status": "pending",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### GET /api/transactions/:id

Get specific transaction by ID.

### PATCH /api/transactions/:id/status

Update transaction status.

**Request Body:**
```json
{
  "status": "processed"
}
```

### GET /api/transactions/stats/summary

Get transaction statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 250,
    "pendingTransactions": 15,
    "processedTransactions": 220,
    "failedTransactions": 15,
    "totalAmount": 125000.00,
    "averageAmount": 500.00
  }
}
```

## NACHA File Endpoints

### POST /api/nacha/generate

Generate NACHA file from transactions.

**Request Body:**
```json
{
  "effectiveDate": "2023-12-15",
  "fileType": "DR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "ACH_DR_20231215_143022.txt",
    "effectiveDate": "2023-12-15",
    "transactionCount": 25,
    "totalAmount": 37500.00,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET /api/nacha/files

List NACHA files with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)

### GET /api/nacha/files/:id

Get NACHA file details including content.

### GET /api/nacha/files/:id/download

Download NACHA file as text file.

### POST /api/nacha/files/:id/validate

Validate NACHA file format.

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "filename": "ACH_DR_20231215_143022.txt"
  }
}
```

### PATCH /api/nacha/files/:id/transmitted

Mark NACHA file as transmitted.

### GET /api/nacha/stats/generation

Get NACHA generation statistics.

## Holiday Management Endpoints

### GET /api/holidays

List federal holidays.

**Query Parameters:**
- `year` (number): Filter by year

### POST /api/holidays

Create federal holiday (Admin only).

**Request Body:**
```json
{
  "name": "Custom Holiday",
  "date": "2023-12-25",
  "year": 2023,
  "recurring": true
}
```

### PUT /api/holidays/:id

Update federal holiday (Admin only).

### DELETE /api/holidays/:id

Delete federal holiday (Admin only).

### POST /api/holidays/generate/:year

Generate default federal holidays for a year (Admin only).

### GET /api/holidays/business-day/check/:date

Check if a date is a business day.

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2023-12-15",
    "isBusinessDay": true,
    "isHoliday": false,
    "isWeekend": false,
    "dayOfWeek": "Friday"
  }
}
```

### GET /api/holidays/business-day/calculate

Calculate business days between two dates.

**Query Parameters:**
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

### GET /api/holidays/business-day/next/:date

Get next business day from a given date.

## System Configuration Endpoints

### GET /api/config

Get all system configuration (Admin only).

### GET /api/config/:key

Get specific configuration by key (Admin only).

### PUT /api/config/:key

Set configuration value (Admin only).

**Request Body:**
```json
{
  "value": "configuration-value",
  "description": "Configuration description"
}
```

### GET /api/config/sftp/settings

Get SFTP settings (Admin only).

### PUT /api/config/sftp/settings

Update SFTP settings (Admin only).

**Request Body:**
```json
{
  "host": "sftp.example.com",
  "port": 22,
  "username": "sftpuser",
  "password": "sftppass",
  "privateKeyPath": "/path/to/key"
}
```

### POST /api/config/sftp/test

Test SFTP connection (Admin only).

### GET /api/config/ach/settings

Get ACH settings (Admin only).

### PUT /api/config/ach/settings

Update ACH settings (Admin only).

**Request Body:**
```json
{
  "immediateDestination": "123456789",
  "immediateOrigin": "987654321",
  "companyName": "Your Company",
  "companyId": "1234567890",
  "companyDiscretionaryData": ""
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints may be rate limited in production. Standard limits:
- Authentication endpoints: 5 requests per minute
- Transaction creation: 100 requests per hour
- File generation: 10 requests per hour
- Other endpoints: 1000 requests per hour

## Webhooks (Future Feature)

The system can be extended to support webhooks for real-time notifications:
- Transaction status changes
- NACHA file generation completion
- SFTP transmission status
- System alerts