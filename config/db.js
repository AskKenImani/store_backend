const mongoose = require('mongoose');
require('dotenv').config();  

const connectDB = async () => {
  console.log("Mongo URI:", process.env.MONGODB_URI);  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
