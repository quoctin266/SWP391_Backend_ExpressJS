import connection from "../config/connectDB";
import _ from "lodash";
import {
  AUTHENTICATION_FAIL,
  DUPLICATE_EMAIL,
  DUPLICATE_USERNAME,
  REGISTER_FAIL,
  FETCHING_FAIL,
  UPDATE_FAIL,
} from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";

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

const postLogin = async (req, res, next) => {
  let { email, password, delay } = req.body;
  let sql = "SELECT * FROM `account` where email = ? and password = ?";

  const [rows] = await connection.execute(sql, [email, password]);
  if (rows.length === 0) {
    throw new AppError(
      AUTHENTICATION_FAIL,
      "Incorrect email or password",
      200,
      delay
    );
  }

  rows[0].birthday = moment(rows[0].birthday).format("YYYY-MM-DD");
  setTimeout(() => {
    res.status(200).json({ DT: rows[0], EC: 0, EM: "Login successfully." });
  }, delay);
};

const postSignup = async (req, res, next) => {
  let { email, username, password } = req.body;

  let sql = "SELECT * FROM `account` where email = ?";
  let [rows] = await connection.execute(sql, [email]);
  if (rows.length > 0) {
    throw new AppError(
      DUPLICATE_EMAIL,
      "An account with this email has already existed.",
      200
    );
  }

  sql = "SELECT * FROM `account` where username = ?";
  [rows] = await connection.execute(sql, [username]);
  if (rows.length > 0) {
    throw new AppError(
      DUPLICATE_USERNAME,
      "This username has already been taken.",
      200
    );
  }

  sql = "INSERT INTO `account` (email, username, password) VALUES (?, ?, ?)";
  rows = await connection.execute(sql, [email, username, password]);
  if (rows.length === 0) {
    throw new AppError(REGISTER_FAIL, "Something went wrong.", 200);
  }

  res.status(200).json({ DT: null, EC: 0, EM: "Register successfully." });
};

const getStation = async (req, res, next) => {
  let sql = "SELECT station_id, name FROM `station` where deleted = false";

  const [rows] = await connection.execute(sql);
  if (rows.length === 0) {
    throw new AppError(FETCHING_FAIL, "Fetching data failed", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch station list successfully." });
};

const putUpdateProfile = async (req, res, next) => {
  let { account_id, email, username, birthday, phone, address } = req.body;

  let sql = "SELECT email,username FROM `account` where account_id = ?";
  let [rows] = await connection.execute(sql, [account_id]);

  if (rows[0].email !== email) {
    sql = "SELECT * FROM `account` where email = ?";
    [rows] = await connection.execute(sql, [email]);
    if (rows.length > 0) {
      throw new AppError(
        DUPLICATE_EMAIL,
        "An account with this email has already existed.",
        200
      );
    }
  }

  if (rows[0].username !== username) {
    sql = "SELECT * FROM `account` where username = ?";
    [rows] = await connection.execute(sql, [username]);
    if (rows.length > 0) {
      throw new AppError(
        DUPLICATE_USERNAME,
        "This username has already been taken.",
        200
      );
    }
  }

  sql =
    "UPDATE `account` SET email = ?, username = ?, birthday = ?, phone = ?, address = ? WHERE account_id = ?";
  rows = await connection.execute(sql, [
    email,
    username,
    birthday,
    phone,
    address,
    account_id,
  ]);
  if (rows.length === 0) {
    throw new AppError(UPDATE_FAIL, "Something went wrong.", 200);
  }

  sql =
    "SELECT email,username,birthday,phone,address FROM `account` where account_id = ?";
  [rows] = await connection.execute(sql, [account_id]);

  rows[0].birthday = moment(rows[0].birthday).format("YYYY-MM-DD");
  res.status(200).json({ DT: rows[0], EC: 0, EM: "Update successfully." });
};

module.exports = {
  getHomepage,
  getUsers,
  postNewUser,
  getAllNews,
  getAllServicesIntro,
  getAllShippingCondition,
  postLogin,
  postSignup,
  getStation,
  putUpdateProfile,
};
