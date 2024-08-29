const mongoose = require("mongoose");
const mongooseURI = "mongodb://localhost:27017/school";    

const connectToMongo = () => {
  mongoose.connect(mongooseURI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

module.exports = connectToMongo;
