import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";

const getAllRoute = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `route` WHERE deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({ DT: rows, EC: 0, EM: "Fetch list successfully." });
};

const getRouteDetail = async (req, res, next) => {
  let routeID = req.params.routeID;

  const [rows] = await connection.execute(
    "SELECT station.station_id, station.name, route_station.station_index, route_station.driving_time, route_station.preDrivingTime, route_station.preDistance, route_station.distance FROM `route_station` JOIN `station` on route_station.station_id = station.station_id WHERE route_station.route_id = ? and station.deleted = false",
    [routeID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Stations not found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch route detail successfully." });
};

const getTripList = async (req, res, next) => {
  let routeID = req.params.routeID;

  const [rows] = await connection.execute(
    "SELECT * FROM `trip` JOIN `transport_vehicle` on trip.vehicle_id = transport_vehicle.vehicle_id JOIN `trip_driver` on trip.trip_id = trip_driver.trip_id JOIN `driver` on trip_driver.driver_id = driver.driver_id WHERE route_id = ? and trip_driver.main_driver = true and trip.deleted = false",
    [routeID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Trip not found.", 200);
  }

  rows.forEach((row) => {
    row.departure_date = moment(row.departure_date)
      .format("DD-MM-YYYY HH:mm:ss")
      .toString();
  });

  res.status(200).json({ DT: rows, EC: 0, EM: "Fetch trips successfully." });
};

const getVehicle = async (req, res, next) => {
  let vehicleID = req.params.vehicleID;

  const [rows] = await connection.execute(
    "SELECT * FROM `transport_vehicle` WHERE vehicle_id = ? and deleted = false",
    [vehicleID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Vehicle not found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows[0], EC: 0, EM: "Fetch vehicle info successfully." });
};

const getDriverList = async (req, res, next) => {
  let tripID = req.params.tripID;

  const [rows] = await connection.execute(
    "SELECT * FROM `trip_driver` JOIN `driver` on trip_driver.driver_id = driver.driver_id WHERE trip_id = ? and driver.deleted = false",
    [tripID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Drivers not found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch drivers info successfully." });
};

const getProgressList = async (req, res, next) => {
  let tripID = req.params.tripID;

  const [rows] = await connection.execute(
    "SELECT * FROM `trip_progress` WHERE trip_id = ? and deleted = false",
    [tripID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Progress info not found.", 200);
  }

  rows.forEach((row) => {
    row.date = moment(row.date).format("DD-MM-YYYY HH:mm:ss").toString();
  });

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch progress info successfully." });
};

const postCreateProgress = async (req, res, next) => {
  let { tripID, description, date } = req.body;

  await connection.execute(
    "INSERT INTO `trip_progress` (description, date, trip_id) VALUES (?, ?, ?)",
    [description, date, tripID]
  );

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Create progress info successfully." });
};

const deleteProgress = async (req, res, next) => {
  let progressID = req.params.progressID;

  await connection.execute(
    "UPDATE `trip_progress` SET deleted = true WHERE progress_id = ?",
    [progressID]
  );

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Delete progress info successfully." });
};

const putUpdateProgess = async (req, res, next) => {
  let { progressID, description, date } = req.body;

  await connection.execute(
    "UPDATE `trip_progress` SET description = ?, date = ? WHERE progress_id = ?",
    [description, date, progressID]
  );

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Update progress info successfully." });
};

const getOrderCapacity = async (req, res, next) => {
  let tripID = req.params.tripID;

  const [rows] = await connection.execute(
    "SELECT * FROM `transport_order` WHERE trip_id  = ?",
    [tripID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Orders not found.", 200);
  }

  for (const row of rows) {
    const [result] = await connection.execute(
      "SELECT SUM(bird_cage.capacity_unit) as total_capacity FROM `order_detail` JOIN `bird_cage` on order_detail.cage_id = bird_cage.cage_id WHERE order_id = ?",
      [row.order_id]
    );
    row.total_capacity = +result[0].total_capacity;
    row.anticipate_date = moment(row.anticipate_date)
      .format("DD-MM-YYYY")
      .toString();
    row.created_time = moment(row.created_time)
      .format("DD-MM-YYYY HH:mm:ss")
      .toString();
    row.estimated_arrival = moment(row.estimated_arrival)
      .format("DD-MM-YYYY HH:mm:ss")
      .toString();
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch capacity info successfully." });
};

const putUpdateTripStatus = async (req, res, next) => {
  let { tripID, status } = req.body;

  await connection.execute("UPDATE `trip` SET status = ? WHERE trip_id = ?", [
    status,
    tripID,
  ]);

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Update trip status successfully." });
};

const putRemoveOrder = async (req, res, next) => {
  let { orderID } = req.body;

  await connection.execute(
    "UPDATE `transport_order` SET trip_id = null, status = ? WHERE order_id  = ?",
    ["Pending", orderID]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Remove order successfully." });
};

const getPendingOrder = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `transport_order` where status = ?",
    ["Pending"]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Orders not found.", 200);
  }

  for (const row of rows) {
    const [result] = await connection.execute(
      "SELECT SUM(bird_cage.capacity_unit) as total_capacity FROM `order_detail` JOIN `bird_cage` on order_detail.cage_id = bird_cage.cage_id WHERE order_id = ?",
      [row.order_id]
    );
    row.total_capacity = +result[0].total_capacity;
    row.anticipate_date = moment(row.anticipate_date)
      .format("DD-MM-YYYY")
      .toString();
    row.created_time = moment(row.created_time)
      .format("DD-MM-YYYY HH:mm:ss")
      .toString();
    row.estimated_arrival = moment(row.estimated_arrival)
      .format("DD-MM-YYYY HH:mm:ss")
      .toString();
  }

  res.status(200).json({ DT: rows, EC: 0, EM: "Fetch list successfully." });
};

const putAssignOrder = async (req, res, next) => {
  let { orderList, tripID } = req.body;

  for (const order of orderList) {
    await connection.execute(
      "UPDATE `transport_order` SET trip_id = ?, status = ? WHERE order_id  = ?",
      [tripID, "Delivering", order.order_id]
    );
  }

  res.status(200).json({ DT: null, EC: 0, EM: "Assign order successfully." });
};

module.exports = {
  getAllRoute,
  getRouteDetail,
  getTripList,
  getVehicle,
  getDriverList,
  getProgressList,
  postCreateProgress,
  deleteProgress,
  putUpdateProgess,
  getOrderCapacity,
  putUpdateTripStatus,
  putRemoveOrder,
  getPendingOrder,
  putAssignOrder,
};
