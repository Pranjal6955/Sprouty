const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
