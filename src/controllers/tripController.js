import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const getAllVehicle = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `transport_vehicle` WHERE deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Vehicle not found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch vehicle list successfully." });
};

const getAllDriver = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `driver` WHERE deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Drivers not found.", 200);
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch driver list successfully." });
};

const postCreateTrip = async (req, res, next) => {
  console.log("check", req.body);
  let { routeID, driverInfo, depart, vehicleID } = req.body;

  let [trip] = await connection.execute(
    "INSERT INTO `trip` (departure_date, status, vehicle_id, route_id) VALUES (?, ?, ?, ?)",
    [depart, "Standby", vehicleID, routeID]
  );

  for (const driver of driverInfo) {
    await connection.execute(
      "INSERT INTO `trip_driver` (trip_id, driver_id, main_driver) VALUES (?, ?, ?)",
      [trip.insertId, driver.driver_id, driver.main_driver]
    );
  }

  res.status(200).json({ DT: null, EC: 0, EM: "Create trip successfully." });
};

module.exports = {
  getAllVehicle,
  getAllDriver,
  postCreateTrip,
};
