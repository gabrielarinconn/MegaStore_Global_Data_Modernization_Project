const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Conectado');
  } catch (err) {
    console.error('❌ Error Mongo:', err);
  }
};

module.exports = connectMongo;
