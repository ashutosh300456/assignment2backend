const mongoose = require("mongoose");
const mongooseURI = "mongodb://localhost:27017/school";    

const connectToMongo = () => {
   mongoose.connect(mongooseURI);
  console.log("final done");
};

module.exports = connectToMongo;




























