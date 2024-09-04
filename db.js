const mongoose = require("mongoose");
const mongooseURI ="mongodb+srv://anshul:Q395dd4hgra_L4V@anshul1.vfwim.mongodb.net/atlas"

const connectToMongo = () => {
   mongoose.connect(mongooseURI);
  console.log("final done");
};

module.exports = connectToMongo;






//    Q395dd4hgra_L4V pass   usrename anshul
// mongodb+srv://anshul:<db_password>@anshul1.vfwim.mongodb.net/?retryWrites=true&w=majority&appName=anshul1



























