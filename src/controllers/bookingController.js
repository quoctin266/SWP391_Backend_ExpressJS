import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND, NO_ROUTE } from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";

const getCustomerByAccount = async (req, res, next) => {
  let accountID = req.params.accountID;

  const [rows] = await connection.execute(
    "SELECT * FROM `customer` where account_id = ? and deleted = false",
    [accountID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getTotalCost = async (req, res, next) => {
  let { birdList, packageID, distance } = req.body;
  let pricingResult;

  if (!distance) {
    throw new AppError(NO_ROUTE, "No current route were found.", 200);
  }

  const [pricing] = await connection.execute(
    "SELECT * FROM `price` WHERE ? >= min_distance and ? < max_distance and deleted = false",
    [distance, distance]
  );

  if (pricing.length !== 0) {
    pricingResult = pricing[0];
  } else {
    const [lastRow] = await connection.execute(
      "SELECT * FROM `price` WHERE max_distance is null and deleted = false"
    );
    pricingResult = lastRow[0];
  }

  let totalCost =
    pricingResult.initial_cost +
    pricingResult.additional_bird_cost * (birdList.length - 1);

  for (const bird of birdList) {
    const [capacityRow] = await connection.execute(
      "SELECT capacity_unit FROM `bird_cage` where cage_id = ? and deleted = false",
      [bird.cage]
    );
    totalCost += capacityRow[0].capacity_unit * pricingResult.unit_cost;
  }

  const [packageRow] = await connection.execute(
    "SELECT price FROM `service_package` WHERE package_id = ? and deleted = false",
    [packageID]
  );
  totalCost += packageRow[0].price;

  res.status(200).json({
    DT: {
      totalCost: totalCost,
    },
    EC: 0,
    EM: "Calculate cost successfully.",
  });
};

const postNewOrder = async (req, res, next) => {
  let { customerID, birdList, generalInfo, totalCost } = req.body;

  let currentTime = moment().format("YYYY-MM-DD HH:mm:ss").toString();

  const [orderRow] = await connection.execute(
    "INSERT INTO `transport_order` (status,bird_quantity,departure_location, arrival_location, anticipate_date, created_time, estimated_arrival, total_cost, customer_id, payment_method_id, package_id  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      "Pending",
      birdList.length,
      generalInfo.departure,
      generalInfo.arrival,
      generalInfo.anticipate,
      currentTime,
      generalInfo.estimate,
      totalCost,
      customerID,
      generalInfo.paymentID,
      generalInfo.packageID,
    ]
  );

  let orderID = orderRow.insertId;

  for (const bird of birdList) {
    const [birdRow] = await connection.execute(
      "INSERT INTO `order_detail` (bird_name,age,weight,gender, note, cage_id, order_id  ) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        bird.name,
        bird.age,
        bird.weight,
        bird.gender,
        bird.note,
        bird.cage,
        orderID,
      ]
    );
  }

  await connection.execute(
    "INSERT INTO `transport_status` (order_status,date,order_id) VALUES (?, ?, ?)",
    ["Order is being processed", currentTime, orderID]
  );

  res.status(200).json({
    DT: {
      orderID: orderID,
      estimate: generalInfo.estimate,
      created: currentTime,
    },
    EC: 0,
    EM: "Create order successfully.",
  });
};

const getAllCage = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `bird_cage` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getAllPackage = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `service_package` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getAllPayment = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `payment_method` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

module.exports = {
  postNewOrder,
  getAllCage,
  getAllPackage,
  getAllPayment,
  getTotalCost,
  getCustomerByAccount,
};
