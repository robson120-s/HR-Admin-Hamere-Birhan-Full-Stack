# API Endpoints

Here is a list of the available API endpoints. The base URL is `/api`.

## Authentication

### `POST /api/auth/register`

- **Description:** Registers a new user.
- **Body:**
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }