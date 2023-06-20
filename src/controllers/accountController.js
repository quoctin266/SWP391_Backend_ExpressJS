import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

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
  let staffCount = 0;
  let managerCount = 0;
  let dataStation = [];

  rows.forEach((row) => {
    if (row.role === "customer") customerCount += 1;
    else if (row.role === "staff") staffCount += 1;
    else if (row.role === "manager") managerCount += 1;
  });

  const [orders] = await connection.execute("SELECT * FROM `transport_order`");
  const [stations] = await connection.execute(
    "SELECT * FROM `station` where deleted = false"
  );

  stations.forEach((station) => {
    let depart = 0;
    let arrive = 0;
    orders.forEach((order) => {
      if (order.departure_location === station.name) depart += 1;
      if (order.arrival_location === station.name) arrive += 1;
    });
    dataStation.push({
      name: station.name,
      Depart: depart,
      Arrive: arrive,
    });
  });

  let dashboardData = {
    customer: customerCount,
    staff: staffCount,
    manager: managerCount,
    orders: orders.length,
    station: dataStation,
  };

  res.status(200).json({
    DT: dashboardData,
    EC: 0,
    EM: "Fetch dashboard data successfully.",
  });
};

module.exports = {
  getAllAccount,
  putUpdateAccount,
  postCreateAccount,
  getDashboard,
};
