import connection from "../config/connectDB";
import _, { result } from "lodash";
import {
  AUTHENTICATION_FAIL,
  DUPLICATE_EMAIL,
  DUPLICATE_USERNAME,
  REGISTER_FAIL,
  WRONG_PASSWORD,
  RECORD_NOTFOUND,
} from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";
import transporter from "../services/sendGmail";
import * as dotenv from "dotenv";

dotenv.config();

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
    const [result] = await connection.execute(sql, [email]);
    if (result.length > 0) {
      throw new AppError(
        DUPLICATE_EMAIL,
        "An account with this email has already existed.",
        200
      );
    }
  }

  if (rows[0].username !== username) {
    sql = "SELECT * FROM `account` where username = ?";
    const [result] = await connection.execute(sql, [username]);
    if (result.length > 0) {
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

const deleteSender = async (req, res, next) => {
  let customerID = req.params.customerID;

  let sql = "UPDATE `customer` SET deleted = true WHERE customer_id = ?";
  await connection.execute(sql, [customerID]);

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

const putUpdateSender = async (req, res, next) => {
  let { customerID, name, address, phone } = req.body;

  let sql =
    "UPDATE `customer` SET full_name = ?, address = ?, phone_number = ? WHERE customer_id = ?";
  await connection.execute(sql, [name, address, phone, customerID]);

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const recoverPassword = async (req, res, next) => {
  let { email } = req.body;

  let sql = "SELECT * FROM `account` where email = ?";
  const [result] = await connection.execute(sql, [email]);
  if (result.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Email not found.", 200);
  }

  let code = Math.floor(Math.random() * 899999 + 100000);

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: `${code} is your account recovery code`,
    html: `<div style="width: 36%;
        font-size: 1.1em;
        border: 1px solid #e5e5e5;
        border-radius: 15px;
        padding: 2%; margin: 0 auto;">
          <div style="margin: 6% 0">Hi ${result[0].username},</div>
          <div style="margin-bottom: 8%;">
            We received a request to reset your password. <br />
            Enter the following password reset code:
          </div>
          <div style="margin-bottom: 7%;
        padding: 10px 15px;
        border-radius: 8px;
        border: 1px solid #1d82ff;
        background-color: aliceblue;
        color:black;
        font-weight: 600;
        font-size: 18px; width:70px; text-align:center" disabled>${code}</div>
          <div style="margin-bottom: 5%;">Before changing password, you have to confirm your password reset code.</div>
          <a href="http://localhost:3000/check-code" style="border-radius: 9px;
          padding: 10px 0;
          border: 1px solid #4095ff;
          width: 95%;
          background-color: #0477ff;
          text-decoration:none;
          display:block;
          font-size:1.1em;color: white; cursor:pointer;font-weight:600; text-align:center">Confirm Code</a>
        </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else console.log("Email sent: ", info.response);
  });

  res.status(200).json({
    DT: { code: code, email: email },
    EC: 0,
    EM: "Check your email for code.",
  });
};

const putChangePassword = async (req, res, next) => {
  let { email, newPassword } = req.body;

  let sql = "UPDATE `account` SET password = ? WHERE email = ?";
  await connection.execute(sql, [newPassword, email]);

  res.status(200).json({
    DT: null,
    EC: 0,
    EM: "Reset password successfully.",
  });
};

module.exports = {
  postLogin,
  postSignup,
  putUpdateProfile,
  putResetPassword,
  postCreateSender,
  deleteSender,
  putUpdateSender,
  recoverPassword,
  putChangePassword,
};
