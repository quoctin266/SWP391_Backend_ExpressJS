import connection from "../config/connectDB";
import _ from "lodash";
import {
  AUTHENTICATION_FAIL,
  DUPLICATE_EMAIL,
  DUPLICATE_USERNAME,
  REGISTER_FAIL,
  UPDATE_FAIL,
  WRONG_PASSWORD,
} from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";

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

  if (rows[0].birthday) {
    rows[0].birthday = moment(rows[0].birthday).format("YYYY-MM-DD");
  }

  if (rows[0].avatar) {
    rows[0].avatar = Buffer.from(rows[0].avatar).toString("binary");
  }

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
  [rows] = await connection.execute(sql, [email, username, password]);

  const [defaultCustomer] = await connection.execute(
    "INSERT INTO `customer` (full_name, account_id)  VALUES (?, ?)",
    [username, rows.insertId]
  );

  if (rows.length === 0) {
    throw new AppError(REGISTER_FAIL, "Something went wrong.", 200);
  }

  res.status(200).json({ DT: null, EC: 0, EM: "Register successfully." });
};

const putUpdateProfile = async (req, res, next) => {
  let { account_id, email, username, birthday, phone, address, avatar } =
    req.body;

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
    "UPDATE `account` SET email = ?, username = ?, birthday = ?, phone = ?, address = ?, avatar = ? WHERE account_id = ?";
  await connection.execute(sql, [
    email,
    username,
    birthday,
    phone,
    address,
    avatar,
    account_id,
  ]);

  sql =
    "SELECT email,username,birthday,phone,address,avatar FROM `account` where account_id = ?";
  [rows] = await connection.execute(sql, [account_id]);

  if (rows[0].birthday) {
    rows[0].birthday = moment(rows[0].birthday).format("YYYY-MM-DD");
  }

  if (rows[0].avatar) {
    rows[0].avatar = Buffer.from(rows[0].avatar).toString("binary");
  }

  res.status(200).json({ DT: rows[0], EC: 0, EM: "Update successfully." });
};

const putResetPassword = async (req, res, next) => {
  let { account_id, oldPassword, newPassword } = req.body;

  let sql = "SELECT password FROM `account` where account_id = ?";
  let [rows] = await connection.execute(sql, [account_id]);
  if (rows[0].password !== oldPassword) {
    throw new AppError(WRONG_PASSWORD, "Incorrect password.", 200);
  }

  sql = "UPDATE `account` SET password = ? WHERE account_id = ?";
  await connection.execute(sql, [newPassword, account_id]);

  res.status(200).json({
    DT: { password: newPassword },
    EC: 0,
    EM: "Update password successfully.",
  });
};

const postCreateSender = async (req, res, next) => {
  let { accountID, name, address, phone } = req.body;
  let sql =
    "INSERT INTO `customer` (full_name, address, phone_number, account_id) VALUES (?, ?, ?, ?)";

  await connection.execute(sql, [name, address, phone, accountID]);

  res.status(200).json({ DT: null, EC: 0, EM: "Sender created successfully." });
};

module.exports = {
  postLogin,
  postSignup,
  putUpdateProfile,
  putResetPassword,
  postCreateSender,
};
