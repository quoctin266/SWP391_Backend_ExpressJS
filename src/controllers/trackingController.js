import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";

const getTransportStatus = async (req, res, next) => {
  let orderID = req.params.orderID;

  const [rows] = await connection.execute(
    "SELECT * FROM `transport_status` where order_id = ? and deleted = false",
    [orderID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No info were found.", 200);
  }

  rows.forEach((row) => {
    row.date = moment(row.date).format("DD-MM-YYYY HH:mm:ss").toString();
  });

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch status list successfully." });
};

module.exports = {
  getTransportStatus,
};
