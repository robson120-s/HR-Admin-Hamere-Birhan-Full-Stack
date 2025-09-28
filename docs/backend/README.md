# Backend Overview

The backend is a Node.js application using the Express.js framework to build a robust REST API.

- **Structure**: The code is organized into routes, controllers, and services to separate concerns.
- **Routing**: All API routes are defined in the `routes/` directory and prefixed with `/api`.
- **Middleware**: We use middleware for handling authentication (JWT) and validating incoming data.
- **ORM**: Prisma ORM is used to interact with the PostgreSQL database in a type-safe way.