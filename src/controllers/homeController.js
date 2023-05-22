import connection from "../config/connectDB";
import _ from "lodash";

// api used to test set up
const getHomepage = (req, res) => {
  res.send("hello from homepage");
};

const getUsers = async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM `users`");
  res.json(rows);
};

const postNewUser = async (req, res) => {
  // standard way to assign value to variable, the long way to code
  let email = req.body.email;
  let name = req.body.name;
  let city = req.body.city;
  let image = req.body.image;

  // object destructuring assignment, shorter way to code
  // let {email, name, city, image} = req.body

  // array destructuring assignment
  const [result] = await connection.execute(
    `INSERT INTO users (email,name,city,image) VALUES (?, ?, ?, ?)`,
    [email, name, city, image]
  );

  // //get the user that has just been created
  const [createdUser] = await connection.execute(
    "SELECT * FROM `users` where id = ?",
    [result.insertId]
  );

  if (createdUser[0].image) {
    createdUser[0].image = Buffer.from(createdUser[0].image).toString("binary");
  }

  res.json(createdUser);
};

// api used for real features
const getAllNews = async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM `news`");
  res.json(rows);
};

const getAllServicesIntro = async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM `services_intro`");

  const resData = _.chain(rows)
    // Group the elements of Array based on `title` property
    .groupBy("title")
    // `key` is group's name (title), `value` is the array of objects
    .map((value, key) => {
      value.forEach((item) => {
        delete item.title;
      });
      return { title: key, description: value };
    })
    .value();

  resData.forEach((item, index) => {
    item.id = index + 1;
  });

  res.json(resData);
};

const getAllShippingCondition = async (req, res) => {
  const [rows] = await connection.execute("SELECT * FROM `shipping_condition`");
  res.json(rows);
};

module.exports = {
  getHomepage,
  getUsers,
  postNewUser,
  getAllNews,
  getAllServicesIntro,
  getAllShippingCondition,
};
