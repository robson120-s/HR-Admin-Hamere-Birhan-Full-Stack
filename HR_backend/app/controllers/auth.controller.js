const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
const user = await prisma.user.findUnique({
      where: { username },
      // *** CRUCIAL FIX: Include the employee relation in the login query ***
      include: {
        employee: { // This will fetch the associated employee record if it exists
          select: {
            id: true,
            firstName: true,
            lastName: true,
            departmentId: true,
            subDepartmentId: true,
          },
        },
        userrole: { // Also include roles for the response
          select: {
            role: {
              select: { name: true }
            }
          }
        }
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Prepare the user object for the response
    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.userrole.map(ur => ur.role.name),
      employee: user.employee, // This will be the employee object or null
    };

    res.json({ message: 'Login successful', token, user: responseUser });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
