import express from "express";
import {
  getHomepage,
  getUsers,
  postNewUser,
  getAllNews,
  getAllServicesIntro,
  getAllShippingCondition,
  postLogin,
  postSignup,
  getStation,
  putUpdateProfile,
} from "../controllers/homeController";
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

module.exports = router;
