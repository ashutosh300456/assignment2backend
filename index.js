const express = require('express');
const connectToMongo = require('./db');
const upload = require('./upload/upload');
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const User = require('./models/user');
const Resume = require('./models/resume');
const fetchuser=require('./middleware/fetchuser')
const jwt = require("jsonwebtoken");
const cors = require('cors');
const app = express();
const PORT=process.env.PORT || 5000
app.use(cors({
  origin: ['*', 'https://66cf2799b0001c69d2c601f8--startling-starlight-1be61e.netlify.app/login'], // No trailing slashes
  methods: 'GET,POST,PUT,DELETE', // Allowed methods
  credentials: true // Allow cookies if necessary
}));





app.use(express.json());

const uploader = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 10 * 1024 * 1024} 
});

connectToMongo();

app.post('/signup', [
    body("name", "please fill the Name field").notEmpty(),
    body("address", "please fill the address field").notEmpty(),
    body("age", "please fill the age field").notEmpty(),
    body("number", "please fill the valid number").notEmpty().isLength({min:10}),
    body("pass", "please fill the pass field").notEmpty(),
    body("email", "please fill the Email field").isEmail()
], async (req, res) => {
    const error = validationResult(req);
    let { name, address, age, number,pass,email } = req.body;
    if (!error.isEmpty()) {
        return res.json({ error: error.array() });
    }
    try {
   let password=await User.findOne({pass:pass});
  //  console.log(password)
        if(password){
            return res.json({msg:"password change this password alrady exists"});
        }
        let storeData = await User.create({
            name: name,
            address: address,
            age: age,
            number: number,
            pass:pass,
            email:email
        });

        let save = await storeData.save();
        return res.json(save);

    } catch (error) {
        console.log(error);
        return res.json({ errors: error });
    }
});

app.post('/upload', uploader.single('file'), async (req, res) => {
  const { userId } = req.body;  

  if (!req.file) {
    return res.status(400).json({ msg: 'File is too large or not provided' });
  }

  try {
    const uploadDta = await upload(req.file.path);  // File upload ke liye cloudinary
    const fileURL = uploadDta.secure_url;

    // Update user document with file URL
    const updatedUser = await User.findByIdAndUpdate(userId, { fileURL: fileURL }, { new: true });

    return res.json({ uploadDta, updatedUser });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
});

app.post(
    "/login",
    [
      body("email", "enter a valid name").isEmail(),
      body("pass", "please fil the password field").notEmpty(),
    ],
    async (req, res) => {
      const error = validationResult(req);
  
      if (!error.isEmpty()) {
       return res.json({ error: error.array() });
      }
  
      try {
  
        let { pass ,email} = req.body;
        // ye findone function hame pura ek object return karke dega jisme bo email mil jayegi uski saari field retyurn karke dega
        let passCheck = await User.findOne({ pass:pass });
  
        if(!passCheck){
          return res.json({msg:'Incorret pass'})
        }
        if(passCheck.email!==email){
            return res.json({msg:'Incorret Email!'})
        }
        const JWT_SECRET = "anshul";
        const userData= {
          Id:passCheck._id 
        }
        const jwtToken = jwt.sign(userData, JWT_SECRET); 
        res.json({ user: jwtToken ,id:userData,data:passCheck});
  
        
      } catch (error) {
        console.log(error);
      }
    }
  )

// Login required:-
  app.post('/detail', async (req, res) => {
    try {
      let {pass}=req.body;  
      const user = await User.findOne({pass:pass}); 
      console.log(user)
      if (!user) {
        return res.status(404).send('User not found');
      }
       return res.json(user);
      // console.log('User data:', user);  // Debug log
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
// Serve index.html for the root route



app.listen(PORT, () => {
    console.log('Server is running on port 5000');
});
