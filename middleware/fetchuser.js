const jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => {
  const token = req.header('auth-token'); 
  if (!token) {
    return res.status(401).send('Invalid token, access denied, code 401');
  }
  const JWT_SECRET = "anshul";
  try {
    const tokenVerify = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', tokenVerify);  // Debug log
    req.userData = tokenVerify;    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).send(error);
  }
};

module.exports = fetchuser;



