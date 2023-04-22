const mongoose = require("mongoose");

const dev = require(".");

const connectDatabase = async () => {
  try {
    await mongoose.connect(dev.db.url);
    console.log("Database is connected");
  } catch (err) {
    console.log("Database is not connected");
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDatabase;
