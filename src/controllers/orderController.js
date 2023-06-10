import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const getOrderList = async (req, res, next) => {
  let status = req.params.status;

  let rows = null;
  if (status === "all") {
    [rows] = await connection.execute(
      "SELECT * FROM `transport_order` JOIN `payment_method` on transport_order.payment_method_id = payment_method.id JOIN `service_package` on transport_order.package_id = service_package.package_id"
    );
  } else {
    [rows] = await connection.execute(
      "SELECT * FROM `transport_order` JOIN `payment_method` on transport_order.payment_method_id = payment_method.id JOIN `service_package` on transport_order.package_id = service_package.package_id where status = ?",
      [status]
    );
  }

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({ DT: rows, EC: 0, EM: "Fetch list successfully." });
};

const getCustomer = async (req, res, next) => {
  let orderID = req.params.orderID;

  const [rows] = await connection.execute(
    "SELECT customer.customer_id, customer.full_name, customer.address, customer.email, customer.phone_number from `customer` join `transport_order` on customer.customer_id = transport_order.customer_id WHERE transport_order.order_id = ?",
    [orderID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({ DT: rows[0], EC: 0, EM: "Fetch list successfully." });
};

const getBirdList = async (req, res, next) => {
  let orderID = req.params.orderID;

  const [rows] = await connection.execute(
    "SELECT * FROM `bird_cage` JOIN `order_detail` on bird_cage.cage_id = order_detail.cage_id WHERE order_detail.order_id = ?",
    [orderID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({ DT: rows, EC: 0, EM: "Fetch list successfully." });
};

const putUpdateOrderStatus = async (req, res, next) => {
  let { orderID, status, departDate } = req.body;

  if (!departDate) departDate = null;
  await connection.execute(
    "UPDATE `transport_order` SET status = ?, departure_date = ? WHERE order_id = ?",
    [status, departDate, orderID]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const postCreateTransportStatus = async (req, res, next) => {
  let { orderID, orderStatus, birdCondition, date } = req.body;

  if (!birdCondition) birdCondition = null;
  await connection.execute(
    "INSERT INTO `transport_status` (order_status, date, bird_condition, order_id) VALUES (?, ?, ?, ?)",
    [orderStatus, date, birdCondition, orderID]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Create status successfully." });
};

const deleteTransportStatus = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `transport_status` SET deleted = true WHERE id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Delete status successfully." });
};

const putUpdateTransportStatus = async (req, res, next) => {
  let { id, orderStatus, birdCondition, date } = req.body;

  if (!birdCondition) birdCondition = null;
  await connection.execute(
    "UPDATE `transport_status` SET order_status = ?, date = ?, bird_condition = ? WHERE id = ?",
    [orderStatus, date, birdCondition, id]
  );

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Update transport status successfully." });
};

module.exports = {
  getOrderList,
  getCustomer,
  getBirdList,
  putUpdateOrderStatus,
  postCreateTransportStatus,
  deleteTransportStatus,
  putUpdateTransportStatus,
};
