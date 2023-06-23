import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
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

const getStation = async (req, res, next) => {
  let sql = "SELECT * FROM `station` where deleted = false";

  const [rows] = await connection.execute(sql);
  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch station list successfully." });
};

const getAllFAQ = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `faq` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getEstimateCost = async (req, res, next) => {
  let { cageID, birdCount, distance } = req.body;
  let pricingResult;

  if (!distance) {
    throw new AppError(NO_ROUTE, "No current route were found.", 200);
  }

  const [pricing] = await connection.execute(
    "SELECT * FROM `price` WHERE ? >= min_distance and ? < max_distance and deleted = false",
    [distance, distance]
  );

  if (pricing.length !== 0) {
    pricingResult = pricing[0];
  } else {
    const [lastRow] = await connection.execute(
      "SELECT * FROM `price` WHERE max_distance is null and deleted = false"
    );
    pricingResult = lastRow[0];
  }

  const [cageRow] = await connection.execute(
    "SELECT capacity_unit FROM `bird_cage` WHERE cage_id = ? and deleted = false",
    [cageID]
  );

  let totalCost =
    pricingResult.initial_cost +
    pricingResult.additional_bird_cost * (birdCount - 1) +
    pricingResult.unit_cost * cageRow[0].capacity_unit * birdCount;

  const [packageRow] = await connection.execute(
    "SELECT price FROM `service_package` WHERE package_id = ? and deleted = false",
    [1]
  );
  totalCost += packageRow[0].price;

  res.status(200).json({
    DT: {
      totalCost: totalCost,
    },
    EC: 0,
    EM: "Estimate cost successfully.",
  });
};

const postCreateFeedback = async (req, res, next) => {
  let { accountID, title, description, createTime } = req.body;
  let sql =
    "INSERT INTO `feedback` (title, description, created_time, account_id) VALUES (?, ?, ?, ?)";

  await connection.execute(sql, [title, description, createTime, accountID]);

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Feedback created successfully." });
};

const getAllFeedback = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `feedback` JOIN account ON feedback.account_id = account.account_id where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  rows.forEach((row) => {
    row.created_time = moment(row.created_time)
      .format("DD-MM-YYYY HH:mm")
      .toString();
    if (row.avatar) {
      row.avatar = Buffer.from(row.avatar).toString("binary");
    }
  });

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch feedback successfully.",
  });
};

module.exports = {
  getHomepage,
  getUsers,
  postNewUser,
  getAllNews,
  getAllServicesIntro,
  getAllShippingCondition,
  getStation,
  getAllFAQ,
  getEstimateCost,
  postCreateFeedback,
  getAllFeedback,
};
