const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


// Authentication middleware to verify JWT and extract user info
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
        roles: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        },
        // CRITICAL: Also fetch the employee profile linked to this user
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            departmentId: true,
          }
        }
      }
    });

if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found or is inactive." });
    }
    
    // 3. Attach a clean, combined user/employee object to the request.
    // We take the first employee profile found (as there should only be one).
    req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map(r => r.role.name),
        // This will now correctly contain the employee object if it exists
        employee: user.employees[0] || null
    };

    next(); // Proceed to the next middleware (authorize) or the route handler

  } catch (err) {
    console.error("Authentication Error:", err.message);
    return res.status(401).json({ error: "Not authorized: Token is invalid or has expired." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user object from 'authenticate' has at least one of the required roles
    if (!req.user || !req.user.roles.some(role => roles.includes(role))) {
      return res.status(403).json({ error: "Access denied: You do not have the required role." });
    }
    next(); // User has the role, proceed
  };
};

module.exports = {
  authenticate,
  authorize,
};