const express = require("express");
const cors = require("cors");
// const home = require("../routes/home");
const users = require("../routes/users");
//const whitelist = ["http://localhost:5000", "http://localhost:3000"];

module.exports = function (app) {
  //---------------------------------
  app.use(cors());
  app.use(express.json());
  //----------------------------------
  // app.use("/", home);
  app.use("/api/user", users);
  //----------------------------------
};
