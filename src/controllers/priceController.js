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

module.exports = {
  getPricing,
};
