import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import router from "./routes/api";
import configViewEngine from "./config/viewEngine";

dotenv.config();

const app = express();

//config cors
const corsOptions = {
  origin: process.env.REACT_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

//config view engine
configViewEngine(app);

//config router
app.use("/", router);

const hostname = process.env.HOST_NAME;
const port = process.env.PORT || 8888;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
