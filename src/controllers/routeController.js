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

module.exports = {
  postCreateRoute,
};
