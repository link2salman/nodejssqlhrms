// const express = require("express");
// const logger = require("morgan");
// const cors = require("cors");

// const whitelist = [
//   "http://localhost:8888",
//   "http://localhost:4200",
// ];

// const corsOptions = {
//   exposedHeaders: "x-auth-token",
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

// module.exports = function (app) {
//   app.use(cors(corsOptions));
//   app.use(
//     express.json({
//       limit: "20mb",
//     })
//   );
//   app.use(
//     express.urlencoded({
//       extended: true,
//       limit: "20mb",
//       parameterLimit: 500000000,
//     })
//   ); //add limit
//   app.use(logger("dev"));
//   task.start();
// };
