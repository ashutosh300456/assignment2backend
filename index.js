const express = require('express');
const connectToMongo = require('./db'); // Import the correct connectToMongo function
const upload = require('./upload/upload');
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const User = require('./models/user');
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

app.post('/signup', async (req, res) => {
  try {
      const { name, address, age, number, pass, email } = req.body;

      // Simulate validation for example
      if (!name || !email) {
          throw new Error('Missing required fields');
      }

      // Create new user
      let newUser = await User.create({ name, address, age, number, pass, email });
      await newUser.save();
      return res.status(201).json(newUser);

  } catch (error) {
      console.error('Signup Error:', error.message); // Log detailed error
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
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
        return res.status(500).json({ error: 'Internal Server Error',error:error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
