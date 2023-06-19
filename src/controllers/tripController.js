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

const postCreateVehicle = async (req, res, next) => {
  let { name, capacity } = req.body;

  await connection.execute(
    "INSERT INTO `transport_vehicle` (vehicle_name, capacity) VALUES (?, ?)",
    [name, capacity]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Vehicle added successfully." });
};

const putUpdateVehicle = async (req, res, next) => {
  let { name, capacity, id } = req.body;

  await connection.execute(
    "UPDATE `transport_vehicle` SET vehicle_name = ?, capacity = ? WHERE vehicle_id = ?",
    [name, capacity, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deleteVehicle = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `transport_vehicle` SET deleted = true WHERE vehicle_id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

const postCreateStation = async (req, res, next) => {
  let { name, address } = req.body;

  await connection.execute(
    "INSERT INTO `station` (name, address) VALUES (?, ?)",
    [name, address]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Station added successfully." });
};

const putUpdateStation = async (req, res, next) => {
  let { name, address, id } = req.body;

  await connection.execute(
    "UPDATE `station` SET name = ?, address = ? WHERE station_id = ?",
    [name, address, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deleteStation = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `station` SET deleted = true WHERE station_id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

module.exports = {
  getAllVehicle,
  getAllDriver,
  postCreateTrip,
  postCreateVehicle,
  putUpdateVehicle,
  deleteVehicle,
  postCreateStation,
  putUpdateStation,
  deleteStation,
};
