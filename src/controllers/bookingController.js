import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const postNewUser = async (req, res) => {
  let { name, address, email, phone, accountID } = req.body;

  const [customer] = await connection.execute(
    "SELECT * FROM `customer` WHERE account_id = ?",
    [accountID]
  );

  let customerID;
  if (customer.length === 0) {
    const [result] = await connection.execute(
      "INSERT INTO customer (full_name,address,email,phone_number, account_id) VALUES (?, ?, ?, ?, ?)",
      [name, address, email, phone, accountID]
    );
    customerID = result.insertId;
  } else customerID = customer[0].customer_id;

  res.json(createdUser);
};
