const express = require('express');
const router = express.Router();
const {login} =require('../controllers/auth.controller');
const { PrismaClient } = require("../generated/prisma"); 
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const { authenticate } = require('../middlewares/authMiddleware'); // This route MUST be protected

// PATCH /api/auth/change-password
router.patch('/change-password', authenticate, async (req, res) => {
  try {
    // 1. Get the user ID from the 'authenticate' middleware.
    // This is secure because it comes from the verified JWT, not the request body.
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // 2. Server-side validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All password fields are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    // 3. Fetch the user from the database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // This case should be rare if the user is authenticated
      return res.status(404).json({ error: 'User not found.' });
    }

    // 4. Verify their current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    // 5. Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 6. Update the password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


router.post('/login', login);



module.exports = router;