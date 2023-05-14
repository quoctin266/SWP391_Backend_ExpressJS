import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

// create the connection to database

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default connection;
