import * as dotenv from "dotenv";
import express from "express";
import router from "./routes/api";
import configViewEngine from "./config/viewEngine";
import configCORS from "./config/configCORS";
import multer from "multer";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app = express();

const upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 },
});

//config cors
configCORS(app);

//config request body
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(upload.array());

//config view engine
configViewEngine(app);

//config router
app.use("/", router);

const hostname = process.env.HOST_NAME;
const port = process.env.PORT || 8888;

app.use(errorHandler);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
