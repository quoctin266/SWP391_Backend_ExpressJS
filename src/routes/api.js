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
  postCreateFeedback,
  getAllFeedback,
} from "../controllers/homeController";
import {
  postLogin,
  postSignup,
  putUpdateProfile,
  putResetPassword,
  postCreateSender,
  deleteSender,
  putUpdateSender,
  recoverPassword,
  putChangePassword,
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
import {
  getPricing,
  postCreatePayment,
  putUpdatePayment,
  deletePayment,
  postCreatePrice,
  putUpdatePrice,
  deletePrice,
  postCreatePackage,
  putUpdatePackage,
  deletePackage,
} from "../controllers/priceController";
import {
  getOrderList,
  getCustomer,
  getBirdList,
  putUpdateOrderStatus,
  postCreateTransportStatus,
  deleteTransportStatus,
  putUpdateTransportStatus,
  getOrderByTrip,
  getOrderByCustomer,
  putCancelOrder,
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
  deleteRoute,
} from "../controllers/routeController";
import {
  getAllVehicle,
  getAllDriver,
  postCreateTrip,
  postCreateVehicle,
  putUpdateVehicle,
  deleteVehicle,
  postCreateStation,
  putUpdateStation,
  deleteStation,
  deleteTrip,
  getAllTrip,
  putUpdateTrip,
} from "../controllers/tripController";
import tryCatch from "../utils/tryCatch";
import {
  getAllAccount,
  putUpdateAccount,
  postCreateAccount,
  getDashboard,
} from "../controllers/accountController";

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
router.post("/api/v1/create-feedback", tryCatch(postCreateFeedback));

router.post("/api/v1/login", tryCatch(postLogin));
router.post("/api/v1/register", tryCatch(postSignup));
router.post("/api/v1/sender", tryCatch(postCreateSender));
router.get("/api/v1/station", tryCatch(getStation));
router.put("/api/v1/update-profile", tryCatch(putUpdateProfile));
router.put("/api/v1/reset-password", tryCatch(putResetPassword));
router.delete("/api/v1/delete-sender/:customerID", tryCatch(deleteSender));
router.put("/api/v1/update-sender", tryCatch(putUpdateSender));
router.post("/api/v1/recover-pw", tryCatch(recoverPassword));
router.put("/api/v1/change-pw", tryCatch(putChangePassword));

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

router.get("/api/v1/list-order", tryCatch(getOrderList));
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
router.get("/api/v1/all-feedback", tryCatch(getAllFeedback));
router.get(
  "/api/v1/order-by-customer/:accountID",
  tryCatch(getOrderByCustomer)
);
router.put("/api/v1/cancel-order", tryCatch(putCancelOrder));

router.post("/api/v1/create-route", tryCatch(postCreateRoute));
router.put("/api/v1/update-route", tryCatch(putUpdateRoute));
router.delete("/api/v1/delete-route/:routeID", tryCatch(deleteRoute));

router.get("/api/v1/alltrip", tryCatch(getAllTrip));
router.get("/api/v1/allvehicle", tryCatch(getAllVehicle));
router.get("/api/v1/alldriver", tryCatch(getAllDriver));
router.post("/api/v1/create-trip", tryCatch(postCreateTrip));
router.post("/api/v1/estimate-cost", tryCatch(getEstimateCost));
router.delete("/api/v1/delete-trip/:tripID", tryCatch(deleteTrip));
router.put("/api/v1/update-trip", tryCatch(putUpdateTrip));

router.post("/api/v1/create-payment", tryCatch(postCreatePayment));
router.get("/api/v1/all-payment", tryCatch(getAllPayment));
router.put("/api/v1/update-payment", tryCatch(putUpdatePayment));
router.delete("/api/v1/delete-payment/:id", tryCatch(deletePayment));
router.post("/api/v1/create-price", tryCatch(postCreatePrice));
router.put("/api/v1/update-price", tryCatch(putUpdatePrice));
router.delete("/api/v1/delete-price/:id", tryCatch(deletePrice));
router.post("/api/v1/create-package", tryCatch(postCreatePackage));
router.put("/api/v1/update-package", tryCatch(putUpdatePackage));
router.delete("/api/v1/delete-package/:id", tryCatch(deletePackage));
router.post("/api/v1/create-vehicle", tryCatch(postCreateVehicle));
router.put("/api/v1/update-vehicle", tryCatch(putUpdateVehicle));
router.delete("/api/v1/delete-vehicle/:id", tryCatch(deleteVehicle));
router.post("/api/v1/create-station", tryCatch(postCreateStation));
router.put("/api/v1/update-station", tryCatch(putUpdateStation));
router.delete("/api/v1/delete-station/:id", tryCatch(deleteStation));

router.get("/api/v1/all-account", tryCatch(getAllAccount));
router.put("/api/v1/update-account", tryCatch(putUpdateAccount));
router.post("/api/v1/create-account", tryCatch(postCreateAccount));
router.get("/api/v1/dashboard", tryCatch(getDashboard));

module.exports = router;
