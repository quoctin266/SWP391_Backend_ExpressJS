import getConnection from "../config/connectDB";

const getHomepage = (req, res) => {
  res.send("hello from homepage");
};

const getUsers = async (req, res) => {
  const connection = await getConnection();

  const [rows] = await connection.execute("SELECT * FROM `users`");
  res.json(rows);
};

module.exports = {
  getHomepage,
  getUsers,
};
