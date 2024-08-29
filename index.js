const express = require('express');
const connectToMongo = require('./db');
const upload = require('./upload/upload');
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const User = require('./models/user');
const Resume = require('./models/resume');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploader = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

connectToMongo();

app.post('/signup', [
    body("name", "Please fill the Name field").notEmpty(),
    body("address", "Please fill the address field").notEmpty(),
    body("age", "Please fill the age field").notEmpty(),
    body("number", "Please fill a valid number").notEmpty().isLength({ min: 10 }),
    body("pass", "Please fill the password field").notEmpty(),
    body("email", "Please fill a valid Email").isEmail()
], async (req, res) => {
    const errors = validationResult(req);
    const { name, address, age, number, pass, email } = req.body;

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if password already exists
        let existingUser = await User.findOne({ pass });
        if (existingUser) {
            return res.status(400).json({ msg: "Password already exists" });
        }

        // Create new user
        let newUser = await User.create({ name, address, age, number, pass, email });
        await newUser.save();
        return res.status(201).json(newUser);

    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/upload', uploader.single('file'), async (req, res) => {
    const { userId } = req.body;

    if (!req.file) {
        return res.status(400).json({ msg: 'File is too large or not provided' });
    }

    try {
        const uploadData = await upload(req.file.path); // File upload to Cloudinary
        const fileURL = uploadData.secure_url;

        // Update user document with file URL
        const updatedUser = await User.findByIdAndUpdate(userId, { fileURL: fileURL }, { new: true });

        return res.json({ uploadData, updatedUser });

    } catch (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({ msg: error.message });
    }
});

app.post('/login', [
    body("email", "Enter a valid email").isEmail(),
    body("pass", "Please fill the password field").notEmpty()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { pass, email } = req.body;
        let user = await User.findOne({ pass });

        if (!user) {
            return res.status(400).json({ msg: 'Incorrect password' });
        }
        if (user.email !== email) {
            return res.status(400).json({ msg: 'Incorrect email' });
        }

        const JWT_SECRET = "your_jwt_secret";
        const userData = { Id: user._id };
        const jwtToken = jwt.sign(userData, JWT_SECRET);

        res.json({ user: jwtToken, id: userData, data: user });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/detail', async (req, res) => {
    try {
        const { pass } = req.body;
        const user = await User.findOne({ pass });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Detail Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
