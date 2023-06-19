import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const getPricing = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `price` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch pricing list successfully." });
};

const postCreatePayment = async (req, res, next) => {
  let { type, name } = req.body;

  if (!name) name = null;
  let sql =
    "INSERT INTO `payment_method` (method_name, payment_type) VALUES (?, ?)";

  await connection.execute(sql, [name, type]);

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Payment method created successfully." });
};

const putUpdatePayment = async (req, res, next) => {
  let { id, name, type } = req.body;

  if (!name) name = null;
  await connection.execute(
    "UPDATE `payment_method` SET method_name = ?, payment_type = ? WHERE id = ?",
    [name, type, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deletePayment = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `payment_method` SET deleted = true WHERE id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

const postCreatePrice = async (req, res, next) => {
  let { min, max, initCost, addition, unitCost } = req.body;

  if (!max) max = null;
  let sql =
    "INSERT INTO `price` (min_distance, max_distance, initial_cost, additional_bird_cost, unit_cost) VALUES (?, ?, ?, ?, ?)";

  await connection.execute(sql, [min, max, initCost, addition, unitCost]);

  res.status(200).json({ DT: null, EC: 0, EM: "Price created successfully." });
};

const putUpdatePrice = async (req, res, next) => {
  let { min, max, initCost, addition, unitCost, id } = req.body;

  if (!max) max = null;
  await connection.execute(
    "UPDATE `price` SET min_distance = ?, max_distance = ?, initial_cost = ?, additional_bird_cost = ?, unit_cost = ? WHERE id = ?",
    [min, max, initCost, addition, unitCost, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deletePrice = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute("UPDATE `price` SET deleted = true WHERE id = ?", [
    id,
  ]);

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

const postCreatePackage = async (req, res, next) => {
  let { name, type, healthcare, pickup, price } = req.body;

  if (healthcare === "true") healthcare = true;
  else healthcare = false;
  if (pickup === "true") pickup = true;
  else pickup = false;

  let sql =
    "INSERT INTO `service_package` (package_name, food_type, healthcare, home_pickup, price) VALUES (?, ?, ?, ?, ?)";

  await connection.execute(sql, [name, type, healthcare, pickup, price]);

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Package created successfully." });
};

const putUpdatePackage = async (req, res, next) => {
  let { name, type, healthcare, pickup, price, id } = req.body;

  await connection.execute(
    "UPDATE `service_package` SET package_name = ?, food_type = ?, healthcare = ?, home_pickup = ?, price = ? WHERE package_id = ?",
    [name, type, healthcare, pickup, price, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deletePackage = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `service_package` SET deleted = true WHERE package_id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

module.exports = {
  getPricing,
  postCreatePayment,
  putUpdatePayment,
  deletePayment,
  postCreatePrice,
  putUpdatePrice,
  deletePrice,
  postCreatePackage,
  putUpdatePackage,
  deletePackage,
};
