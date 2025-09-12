const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("../generated/prisma");
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
      select: {
        // Select only the fields you need from the User table
        id: true,
        username: true,
        email: true,
        password: true,
        isActive: true,
        // Select the role names through the relations
        userrole: {
          // <-- correct relation
          select: {
            role: {
              // role is the relation inside userrole
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.userrole.map((r) => r.role.name),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login Failed." });
  }
};
