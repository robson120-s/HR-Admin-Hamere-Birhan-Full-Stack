// HR_backend/app/routes/upload.routes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middlewares/authMiddleware'); // Or your correct path

// --- Multer Configuration ---
// 1. Define where to store the files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // The folder we created
    },
    // 2. Define how to name the files to avoid conflicts
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 3. Create the multer instance with the storage configuration
const upload = multer({ storage: storage });

// --- API Route ---
// POST /api/upload/photo - Handles a single file upload named 'photo'
router.post('/photo', authenticate, upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file was uploaded.' });
        }

        // The file was successfully uploaded by multer.
        // Now, we send back the information the frontend needs.
        res.status(201).json({
            message: 'File uploaded successfully!',
            // We send back the path to the file so it can be saved in the database
            filePath: `/uploads/${req.file.filename}` 
        });

    } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ error: 'Failed to upload file.' });
    }
});

module.exports = router;