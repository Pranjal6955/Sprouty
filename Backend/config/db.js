const mongoose = require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!mongoURI) {
      console.error('MONGO_URI environment variable is not defined');
      process.exit(1);
    }

    // Connection options - removed deprecated options
    const options = {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10 
    };

    await mongoose.connect(mongoURI, options);
    
    console.log('MongoDB Connected...');
  } catch (err) {
    // Enhanced error handling
    if (err.name === 'MongoServerSelectionError') {
      console.error('Unable to connect to MongoDB server. Please check your connection string and make sure your MongoDB server is running.');
    } else if (err.message.includes('bad auth')) {
      console.error('MongoDB authentication failed. Please check your username and password in your MONGO_URI environment variable.');
      console.error('Expected format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    } else {
      console.error('Database connection error:', err.message);
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
