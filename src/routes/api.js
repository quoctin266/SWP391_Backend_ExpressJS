import express from "express";
import {
  getHomepage,
  getUsers,
  postNewUser,
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

module.exports = router;
