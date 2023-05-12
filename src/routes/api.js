import express from "express";
import { getHomepage, getUsers } from "../controllers/homeController";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("sample.ejs");
});

router.get("/home", getHomepage);

// api format
router.get("/api/v1/users", getUsers);

module.exports = router;
