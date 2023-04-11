const mySql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const connection = mySql.createPool({
  host: process.env.DB_HOST_NAME,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: process.env.CONNECTION_TIMEOUT,
});

module.exports = connection;
