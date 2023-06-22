import connection from "../config/connectDB";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const postCreateRoute = async (req, res, next) => {
  let { routeDetail, description } = req.body;

  let [route] = await connection.execute(
    "INSERT INTO `route` (departure, destination, description) VALUES (?, ?, ?)",
    [routeDetail[0].name, routeDetail[routeDetail.length - 1].name, description]
  );

  for (const station of routeDetail) {
    await connection.execute(
      "INSERT INTO `route_station` (route_id, station_id, station_index, driving_time, preDrivingTime, distance, preDistance) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        route.insertId,
        station.stationID,
        station.station_index,
        station.originTimeMinute,
        station.preTimeMinute,
        station.originDistance,
        station.preDistance,
      ]
    );
  }

  res.status(200).json({ DT: null, EC: 0, EM: "Create route successfully." });
};

const putUpdateRoute = async (req, res, next) => {
  let { routeDetail, description, routeID } = req.body;

  await connection.execute("DELETE FROM `route_station` WHERE route_id = ?", [
    routeID,
  ]);

  for (const station of routeDetail) {
    await connection.execute(
      "INSERT INTO `route_station` (route_id, station_id, station_index, driving_time, preDrivingTime, distance, preDistance) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        routeID,
        station.station_id,
        station.station_index,
        station.driving_time,
        station.preDrivingTime,
        station.distance,
        station.preDistance,
      ]
    );
  }

  await connection.execute(
    "UPDATE `route` SET description = ?, departure = ?, destination = ? WHERE route_id = ?",
    [
      description,
      routeDetail[0].name,
      routeDetail[routeDetail.length - 1].name,
      routeID,
    ]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update route successfully." });
};

const deleteRoute = async (req, res, next) => {
  let routeID = req.params.routeID;

  await connection.execute(
    "UPDATE `route` SET deleted = true WHERE route_id = ?",
    [routeID]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Delete route successfully." });
};

module.exports = {
  postCreateRoute,
  putUpdateRoute,
  deleteRoute,
};
