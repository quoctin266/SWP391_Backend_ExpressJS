import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const getAllService = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `service` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

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

  res.status(200).json({
    DT: resData,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

module.exports = {
  getAllService,
};
