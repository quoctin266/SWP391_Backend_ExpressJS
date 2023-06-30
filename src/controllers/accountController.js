import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";
import _ from "lodash";
import moment from "moment";

const getAllAccount = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `account` WHERE role <> ?",
    ["admin"]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch account list successfully." });
};

const putUpdateAccount = async (req, res, next) => {
  let { role, status, id } = req.body;

  await connection.execute(
    "UPDATE `account` SET role = ?, account_status = ? WHERE account_id = ?",
    [role, status, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const postCreateAccount = async (req, res, next) => {
  let { email, username, password, role } = req.body;

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

  sql =
    "INSERT INTO `account` (email, username, password, role) VALUES (?, ?, ?, ?)";
  [rows] = await connection.execute(sql, [email, username, password, role]);

  await connection.execute(
    "INSERT INTO `customer` (full_name, account_id)  VALUES (?, ?)",
    [username, rows.insertId]
  );

  if (rows.length === 0) {
    throw new AppError(REGISTER_FAIL, "Something went wrong.", 200);
  }

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Account created successfully." });
};

const getDashboard = async (req, res, next) => {
  const [rows] = await connection.execute("SELECT * FROM `account`");

  let customerCount = 0;
  let completed = 0;
  let canceled = 0;
  let dataStationDepart = [];
  let dataStationArrive = [];

  rows.forEach((row) => {
    if (row.role === "customer") customerCount += 1;
  });

  const [orders] = await connection.execute("SELECT * FROM `transport_order`");
  const [stations] = await connection.execute(
    "SELECT * FROM `station` where deleted = false"
  );

  orders.forEach((order) => {
    if (order.status === "Completed") completed += 1;
    if (order.status === "Canceled") canceled += 1;
  });

  stations.forEach((station) => {
    let depart = 0;
    let arrive = 0;
    orders.forEach((order) => {
      if (order.departure_location === station.name) depart += 1;
      if (order.arrival_location === station.name) arrive += 1;
    });
    dataStationDepart.push({
      name: station.name,
      Depart: depart,
    });
    dataStationArrive.push({
      name: station.name,
      Arrive: arrive,
    });
  });

  let dashboardData = {
    customer: customerCount,
    completed: completed,
    canceled: canceled,
    orders: orders.length,
    stationDepart: dataStationDepart,
    stationArrive: dataStationArrive,
  };

  res.status(200).json({
    DT: dashboardData,
    EC: 0,
    EM: "Fetch dashboard data successfully.",
  });
};

const getYearRevenue = async (req, res, next) => {
  let year = req.params.year;

  const [rows] = await connection.execute(
    "SELECT * FROM `transport_order` WHERE YEAR(created_time) = ? AND status = ?",
    [year, "Completed"]
  );
  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No data were found.", 200);
  }

  let revenueData = [];
  for (let i = 1; i < 13; i++) {
    let income = 0;
    rows.forEach((order) => {
      let date = moment(order.created_time, "YYYY-MM-DD");
      if (+date.format("M") === i) {
        income += order.total_cost;
      }
    });
    revenueData.push({
      month: moment()
        .month(i - 1)
        .format("MMM"),
      Income: income,
    });
  }

  res.status(200).json({
    DT: revenueData,
    EC: 0,
    EM: "Fetch revenue data successfully.",
  });
};

module.exports = {
  getAllAccount,
  putUpdateAccount,
  postCreateAccount,
  getDashboard,
  getYearRevenue,
};
