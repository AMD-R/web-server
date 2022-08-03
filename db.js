const Mongoose = require('mongoose');
const { dbURI, database } = require('./config.json');

const connectDB = async () => {
  await Mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: database,
  });

  console.log('MongoDB Connected');
};

module.exports = connectDB;
