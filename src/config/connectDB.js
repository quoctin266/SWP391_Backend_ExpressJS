import mysql from "mysql2/promise";

// create the connection to database
const getConnection = async () => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "bird_transportation_system",
  });
  return connection;
};

export default getConnection;
