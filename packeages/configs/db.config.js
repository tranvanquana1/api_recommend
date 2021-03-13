"use strict";

const mongoose = require("mongoose");

exports.connectDatabase = () => {
  // const mongoDbUrl = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;
  const mongoDbUrl = `mongodb+srv://admin:admin@cluster0.igcnz.mongodb.net/recommendDB?retryWrites=true&w=majority`;
  console.log(`Connecting to ${mongoDbUrl}`);

  mongoose.Promise = global.Promise;
  mongoose
    .connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((err) => {
      console.log("Could not connect to database...", err);
      process.exit();
    });

    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
};
