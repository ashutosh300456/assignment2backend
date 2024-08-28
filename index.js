const express = require('express');
const connectToMongo = require('./db');
const upload = require('./upload/upload');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const User = require('./models/user');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins array
const allowedOrigins = [
  'https://assignment2backend.onrender.com',
  'https://66cf66daba7508b62b9f370a--startling-starlight-1be61e.netlify.app'
];

// Custom CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});


app.use(express.json());

const uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Connect to MongoDB
connectToMongo();

// Signup Route
app.post('/signup', [
  body("name", "Please fill the Name field").notEmpty(),
  body("address", "Please fill the Address field").notEmpty(),
  body("age", "Please fill the Age field").notEmpty(),
  body("number", "Please fill a valid number").notEmpty().isLength({ min: 10 }),
  body("pass", "Please fill the Password field").notEmpty(),
  body("email", "Please fill a valid Email").isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, age, number, pass, email } = req.body;
  try {
    let existingUser = await User.findOne({ pass });
    if (existingUser) {
      return res.status(400).json({ msg: "Password already exists, please choose a different password" });
    }

    let newUser = new User({ name, address, age, number, pass, email });
    await newUser.save();
    res.status(201).json(newUser);

  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: 'Internal Server Error' });
  }
});

// Upload Route
app.post('/upload', uploader.single('file'), async (req, res) => {
  const { userId } = req.body;

  if (!req.file) {
    return res.status(400).json({ msg: 'File is too large or not provided' });
  }

  try {
    const uploadDta = await upload(req.file.path);  // File upload ke liye cloudinary
    const fileURL = uploadDta.secure_url;

    // Update user document with file URL
    const updatedUser = await User.findByIdAndUpdate(userId, { fileURL }, { new: true });

    res.json({ uploadDta, updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

// Login Route
app.post('/login', [
  body("email", "Enter a valid email").isEmail(),
  body("pass", "Please fill the Password field").notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pass, email } = req.body;
  try {
    let user = await User.findOne({ pass });
    if (!user || user.email !== email) {
      return res.status(400).json({ msg: 'Incorrect email or password' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: 'Internal Server Error' });
  }
});

// Detail Route
app.post('/detail', async (req, res) => {
  const { pass } = req.body;
  try {
    let user = await User.findOne({ pass });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: 'Internal Server Error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
