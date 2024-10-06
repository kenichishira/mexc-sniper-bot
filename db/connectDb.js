const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('=> Database connection established.');
  } catch (error) {
    console.error(error);
  }
};

module.exports = connectDb;