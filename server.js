"use strict";

const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

//
const userRoute = require("./packeages/routes/user.routes");
const movieRoute = require("./packeages/routes/movie.routes");
const categoryRoute = require("./packeages/routes/category.routes");

//
const connectDatabase = require("./packeages/configs/db.config");
dotenv.config();

const app = express();
connectDatabase.connectDatabase();

// Middlewares
app.use(logger("dev"));
//parser requests of content-type - application/json
app.use(bodyParser.json());

//parser requests of content-type - application/x-www-form-urlencodes
app.use(bodyParser.urlencoded({ extended: true }));

// Routes

app.use("/user", userRoute);
app.use("/movie", movieRoute);
app.use("/category", categoryRoute);


app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Server is OK",
  });
});

// Catch 404 Errors and forward them to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler function
app.use(() => {
  const error = app.get("env") === "deverlopment" ? err : {};
  const status = err.status || 500;

  // response to client
  return res.status(status).json({
    error: {
      message: error.message,
    },
  });
});

// Start server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
