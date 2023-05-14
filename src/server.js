import * as dotenv from "dotenv";
import express from "express";
import router from "./routes/api";
import configViewEngine from "./config/viewEngine";
import configCORS from "./config/configCORS";

dotenv.config();

const app = express();

//config cors
configCORS(app);

//config request body
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//config view engine
configViewEngine(app);

//config router
app.use("/", router);

const hostname = process.env.HOST_NAME;
const port = process.env.PORT || 8888;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
