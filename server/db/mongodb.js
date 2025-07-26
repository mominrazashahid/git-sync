const mongoose = require('mongoose');
exports.connectToDb = (MONGO_URI) => {
   mongoose.connect(MONGO_URI)
  .then(() => {
    isConnected = true;
    console.log('Sussessfullt connected to mongoDB')})
  .catch(err => console.error('MongoDB connection error:', err));
}