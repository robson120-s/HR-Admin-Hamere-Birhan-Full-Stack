const jwt = require('jsonwebtoken');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Authentication middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
        userrole: {
          select: {
            role: {
              select: { name: true }
            }
          }
        },
        employee: { // use singular, matches schema
          select: {
            id: true,
            firstName: true,
            lastName: true,
            departmentId: true,
            subDepartmentId: true
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.userrole.map(r => r.role.name),
      employee: user.employee || null
    };

    next();
  } catch (err) {
    console.error('Authentication Error:', err.message);
    return res.status(401).json({ error: 'Not authorized: Token is invalid or has expired.' });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.some(role => roles.includes(role))) {
      return res.status(403).json({ error: 'Access denied: You do not have the required role.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('../generated/prisma');
// const prisma = new PrismaClient();

// // Authentication middleware to verify JWT and extract user info
// const authenticate = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ error: 'Access token missing' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await prisma.user.findUnique({
//       where: { id: decoded.id },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         isActive: true,
//         userrole: { // <-- Prisma relation
//           select: {
//             role: {
//               select: {
//                 name: true
//               }
//             }
//           }
//         },
//         employees: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             departmentId: true,
//             subDepartmentId: true,
//           }
//         }
//       }
//     });

//     if (!user || !user.isActive) {
//       return res.status(401).json({ error: "User not found or is inactive." });
//     }

//     if (!user.employees || user.employees.length === 0) {
//       return res.status(403).json({ error: "No employee profile associated with this user." });
//     }

//     // Attach a clean user object
//     req.user = {
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       roles: user.userrole.map(r => r.role.name), // <-- fixed here
//       employee: user.employees[0]
//     };

//     next();

//   } catch (err) {
//     console.error("Authentication Error:", err.message);
//     return res.status(401).json({ error: "Not authorized: Token is invalid or has expired." });
//   }
// };

// const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.roles.some(role => roles.includes(role))) {
//       return res.status(403).json({ error: "Access denied: You do not have the required role." });
//     }
//     next();
//   };
// };

// module.exports = {
//   authenticate,
//   authorize,
// };
