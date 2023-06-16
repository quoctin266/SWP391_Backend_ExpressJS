import express from "express";
import {
  getHomepage,
  getUsers,
  postNewUser,
  getAllNews,
  getAllServicesIntro,
  getAllShippingCondition,
  getStation,
  getAllFAQ,
  getEstimateCost,
} from "../controllers/homeController";
import {
  postLogin,
  postSignup,
  putUpdateProfile,
  putResetPassword,
} from "../controllers/authController";
import { getAllService } from "../controllers/serviceController";
import {
  getAllCage,
  getAllPackage,
  getAllPayment,
  postNewOrder,
  getTotalCost,
  getCustomerByAccount,
} from "../controllers/bookingController";
import { getTransportStatus } from "../controllers/trackingController";
import { getPricing } from "../controllers/priceController";
import {
  getOrderList,
  getCustomer,
  getBirdList,
  putUpdateOrderStatus,
  postCreateTransportStatus,
  deleteTransportStatus,
  putUpdateTransportStatus,
  getOrderByTrip,
} from "../controllers/orderController";
import {
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
} from "../controllers/scheduleController";
import {
  postCreateRoute,
  putUpdateRoute,
} from "../controllers/routeController";
import {
  getAllVehicle,
  getAllDriver,
  postCreateTrip,
} from "../controllers/tripController";
import tryCatch from "../utils/tryCatch";

const router = express.Router();

// funtion as a parameter exmaple 1
router.get("/", (req, res) => {
  res.render("sample.ejs");
});

// funtion as a parameter exmaple 2
router.get("/home", getHomepage);

// api format
router.get("/api/v1/users", getUsers);
router.post("/api/v1/create-user", postNewUser);

// offcial API
router.get("/api/v1/news", getAllNews);
router.get("/api/v1/services-intro", getAllServicesIntro);
router.get("/api/v1/shipping-condition", getAllShippingCondition);
router.post("/api/v1/login", tryCatch(postLogin));
router.post("/api/v1/register", tryCatch(postSignup));
router.get("/api/v1/station", tryCatch(getStation));
router.put("/api/v1/update-profile", tryCatch(putUpdateProfile));
router.put("/api/v1/reset-password", tryCatch(putResetPassword));
router.get("/api/v1/faq", tryCatch(getAllFAQ));
router.get("/api/v1/service", tryCatch(getAllService));
router.get("/api/v1/cage", tryCatch(getAllCage));
router.get("/api/v1/package", tryCatch(getAllPackage));
router.get("/api/v1/payment", tryCatch(getAllPayment));
router.post("/api/v1/create-order", tryCatch(postNewOrder));
router.post("/api/v1/total-cost", tryCatch(getTotalCost));
router.get("/api/v1/customers/:accountID", tryCatch(getCustomerByAccount));

router.get("/api/v1/transport-status/:orderID", tryCatch(getTransportStatus));
router.get("/api/v1/price", tryCatch(getPricing));

router.get("/api/v1/list-order/:status", tryCatch(getOrderList));
router.get("/api/v1/customer/:orderID", tryCatch(getCustomer));
router.get("/api/v1/bird/:orderID", tryCatch(getBirdList));
router.put("/api/v1/update-order-status", tryCatch(putUpdateOrderStatus));
router.post(
  "/api/v1/create-transport-status",
  tryCatch(postCreateTransportStatus)
);
router.delete(
  "/api/v1/delete-order-status/:id",
  tryCatch(deleteTransportStatus)
);
router.put(
  "/api/v1/update-transport-status",
  tryCatch(putUpdateTransportStatus)
);

router.get("/api/v1/all-route", tryCatch(getAllRoute));
router.get("/api/v1/route/:routeID", tryCatch(getRouteDetail));
router.get("/api/v1/trips/:routeID", tryCatch(getTripList));
router.get("/api/v1/vehicle/:vehicleID", tryCatch(getVehicle));
router.get("/api/v1/drivers/:tripID", tryCatch(getDriverList));
router.get("/api/v1/progress/:tripID", tryCatch(getProgressList));
router.post("/api/v1/create-progress", tryCatch(postCreateProgress));
router.delete("/api/v1/delete-progress/:progressID", tryCatch(deleteProgress));
router.put("/api/v1/update-progress", tryCatch(putUpdateProgess));
router.get("/api/v1/order/:tripID", tryCatch(getOrderCapacity));
router.put("/api/v1/update-trip-status", tryCatch(putUpdateTripStatus));
router.put("/api/v1/remove-order", tryCatch(putRemoveOrder));
router.get("/api/v1/pending-order", tryCatch(getPendingOrder));
router.put("/api/v1/assign-order", tryCatch(putAssignOrder));
router.get("/api/v1/order-by-trip/:tripID", tryCatch(getOrderByTrip));

router.post("/api/v1/create-route", tryCatch(postCreateRoute));
router.put("/api/v1/update-route", tryCatch(putUpdateRoute));

router.get("/api/v1/allvehicle", tryCatch(getAllVehicle));
router.get("/api/v1/alldriver", tryCatch(getAllDriver));
router.post("/api/v1/create-trip", tryCatch(postCreateTrip));
router.post("/api/v1/estimate-cost", tryCatch(getEstimateCost));

module.exports = router;
