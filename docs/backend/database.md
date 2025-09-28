# Database Schema

The database schema is managed with Prisma. The schema defines all the models (tables), their fields, and the relations between them.

## Key Models

- **User**: Stores user credentials and profile information.
- **Employee**: Contains all details related to an employee.
- **Department**: Manages different departments within the organization.
- **Position**: Defines job titles and roles.

Below is a snippet from the `schema.prisma` file showing the `Employee` model:

```prisma
// Example from schema.prisma
model Employee {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  email     String   @unique
  phone     String?
  hireDate  DateTime
  // ... other fields and relations
}