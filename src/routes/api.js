import express from "express";
import {
  getHomepage,
  getUsers,
  postNewUser,
  getAllNews,
  getAllServicesIntro,
  getAllShippingCondition,
} from "../controllers/homeController";

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
router.get("/api/v1/news", getAllNews);
router.get("/api/v1/services-intro", getAllServicesIntro);
router.get("/api/v1/shipping-condition", getAllShippingCondition);

module.exports = router;
