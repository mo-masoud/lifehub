# API Response Format

## Overview

This document outlines the standardized API response format used throughout the LifeHub application. Our format follows the [JSend specification](https://github.com/omniti-labs/jsend) and incorporates best practices from [RFC 9457 Problem Details](https://datatracker.ietf.org/doc/html/rfc9457) for error handling.

## Response Structure

All API responses follow a consistent JSON structure with the following fields:

### Required Fields

- **`status`** (string): Indicates the outcome of the request

    - `"success"` - Request completed successfully (2xx status codes)
    - `"fail"` - Request failed due to client error (4xx status codes)
    - `"error"` - Request failed due to server error (5xx status codes)

- **`data`** (object|array|null): The main response payload

### Optional Fields

- **`message`** (string): Human-readable description of the result
- **`errors`** (object): Validation errors or detailed error information

## Examples

### Success Response (200 OK)

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "Work Folder",
            "featured": true,
            "created_at": "2025-01-01T10:00:00.000000Z",
            "updated_at": "2025-01-01T10:00:00.000000Z"
        }
    ]
}
```

### Success Response with Message (201 Created)

```json
{
    "status": "success",
    "message": "Folder created successfully",
    "data": {
        "folder": {
            "id": 2,
            "name": "Personal Projects",
            "featured": false,
            "created_at": "2025-01-01T10:30:00.000000Z",
            "updated_at": "2025-01-01T10:30:00.000000Z"
        }
    }
}
```

### Client Error Response (422 Unprocessable Entity)

```json
{
    "status": "fail",
    "message": "The given data was invalid.",
    "data": null,
    "errors": {
        "name": ["The name field is required."],
        "email": ["The email must be a valid email address."]
    }
}
```

### Server Error Response (500 Internal Server Error)

```json
{
    "status": "error",
    "message": "An unexpected error occurred. Please try again later.",
    "data": null
}
```

## HTTP Status Codes

Our API uses standard HTTP status codes to indicate the outcome of requests:

### Success (2xx)

- **200 OK** - Request successful, data returned
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no data returned

### Client Errors (4xx)

- **400 Bad Request** - Invalid request format
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **422 Unprocessable Entity** - Validation errors

### Server Errors (5xx)

- **500 Internal Server Error** - Unexpected server error
- **503 Service Unavailable** - Service temporarily unavailable

## Implementation

### Using the Helper Function

Use the `api_response()` helper function for consistent responses:

```php
// Success response
return api_response($folders);

// Success with message
return api_response(
    data: ['folder' => $folder],
    status: 201,
    message: 'Folder created successfully'
);

// Client error with validation errors
return api_response(
    data: null,
    status: 422,
    message: 'The given data was invalid.',
    errors: $validator->errors()
);

// Server error
return api_response(
    data: null,
    status: 500,
    message: 'An unexpected error occurred'
);
```

### Frontend Handling

When consuming these APIs in the frontend, always check the `status` field:

```javascript
axios
    .get('/api/v1/folders')
    .then((response) => {
        const { status, data, message } = response.data;

        if (status === 'success') {
            // Handle successful response
            setFolders(data || []);
            if (message) {
                toast.success(message);
            }
        }
    })
    .catch((error) => {
        const errorResponse = error.response?.data;
        const errorMessage = errorResponse?.message || 'An error occurred';

        if (errorResponse?.errors) {
            // Handle validation errors
            Object.values(errorResponse.errors)
                .flat()
                .forEach((err) => {
                    toast.error(err);
                });
        } else {
            toast.error(errorMessage);
        }
    });
```

## Benefits

This standardized format provides:

1. **Consistency** - All endpoints follow the same structure
2. **Clarity** - Easy to understand success/failure states
3. **Flexibility** - Supports various data types and error scenarios
4. **Security** - Prevents accidental exposure of sensitive information
5. **Standards Compliance** - Follows industry best practices

## Migration from Legacy Format

When updating existing APIs:

1. Update controller methods to use `api_response()` helper
2. Update tests to expect new response structure
3. Update frontend code to handle new format
4. Maintain backward compatibility during transition periods
5. Document changes in API changelog

This format ensures a consistent, secure, and developer-friendly API experience across the entire application.
