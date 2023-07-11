import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND, NO_ROUTE } from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";
import transporter from "../services/sendGmail";
import * as dotenv from "dotenv";

dotenv.config();

const getCustomerByAccount = async (req, res, next) => {
  let accountID = req.params.accountID;

  const [rows] = await connection.execute(
    "SELECT * FROM `customer` where account_id = ? and deleted = false",
    [accountID]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getTotalCost = async (req, res, next) => {
  let { birdList, packageID, distance } = req.body;
  let pricingResult;

  if (!distance) {
    throw new AppError(NO_ROUTE, "No current route were found.", 200);
  }

  const [pricing] = await connection.execute(
    "SELECT * FROM `price` WHERE ? >= min_distance and ? < max_distance and deleted = false",
    [distance, distance]
  );

  if (pricing.length !== 0) {
    pricingResult = pricing[0];
  } else {
    const [lastRow] = await connection.execute(
      "SELECT * FROM `price` WHERE max_distance is null and deleted = false"
    );
    pricingResult = lastRow[0];
  }

  let totalCost =
    pricingResult.initial_cost +
    pricingResult.additional_bird_cost * (birdList.length - 1);

  let totalUnit = 0;
  for (const bird of birdList) {
    const [capacityRow] = await connection.execute(
      "SELECT capacity_unit FROM `bird_cage` where cage_id = ? and deleted = false",
      [bird.cage]
    );
    totalUnit += capacityRow[0].capacity_unit;
    totalCost += capacityRow[0].capacity_unit * pricingResult.unit_cost;
  }

  const [packageRow] = await connection.execute(
    "SELECT * FROM `service_package` WHERE package_id = ? and deleted = false",
    [packageID]
  );
  totalCost += packageRow[0].price;

  res.status(200).json({
    DT: {
      totalCost: totalCost,
      distance: distance,
      initCost: pricingResult.initial_cost,
      extraBird: birdList.length - 1,
      extraBirdCost: pricingResult.additional_bird_cost * (birdList.length - 1),
      capacityUnit: totalUnit,
      unitCost: totalUnit * pricingResult.unit_cost,
      package: packageRow[0].package_name,
      packageCost: packageRow[0].price,
    },
    EC: 0,
    EM: "Calculate cost successfully.",
  });
};

const postNewOrder = async (req, res, next) => {
  let { customerID, birdList, generalInfo, totalCost } = req.body;

  let currentTime = moment().format("YYYY-MM-DD HH:mm:ss").toString();

  const [orderRow] = await connection.execute(
    "INSERT INTO `transport_order` (status,bird_quantity,departure_location, arrival_location, anticipate_date, created_time, estimated_arrival, total_cost, customer_id, payment_method_id, package_id  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      "Pending",
      birdList.length,
      generalInfo.departure,
      generalInfo.arrival,
      generalInfo.anticipate,
      currentTime,
      generalInfo.estimate,
      totalCost,
      customerID,
      generalInfo.paymentID,
      generalInfo.packageID,
    ]
  );

  let orderID = orderRow.insertId;

  for (const bird of birdList) {
    const [birdRow] = await connection.execute(
      "INSERT INTO `order_detail` (bird_name,age,weight,gender, note, cage_id, order_id  ) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        bird.name,
        bird.age,
        bird.weight,
        bird.gender,
        bird.note,
        bird.cage,
        orderID,
      ]
    );
  }

  await connection.execute(
    "INSERT INTO `transport_status` (order_status,date,order_id) VALUES (?, ?, ?)",
    ["Order is being processed", currentTime, orderID]
  );

  res.status(200).json({
    DT: {
      orderID: orderID,
      estimate: generalInfo.estimate,
      created: currentTime,
      totalCost: totalCost,
    },
    EC: 0,
    EM: "Create order successfully.",
  });
};

const getAllCage = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `bird_cage` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getAllPackage = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `service_package` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const getAllPayment = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `payment_method` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  res.status(200).json({
    DT: rows,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const sendBill = async (req, res, next) => {
  let { costSummary, customerInfo, orderID, created, email } = req.body;

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: `Bird Transportation Invoice`,
    html: `<div style="width: 80%;
    font-size: 1.2em;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    padding: 4% 0; margin: 0 auto;">
    <div style="display:flex;
padding-left: 8%;
margin-bottom: 4%;">
    <div style="width:100%">
      <div style="margin: 6% 0; font-size: 1.5em; margin-bottom: 30px; font-weight:600">Bird Travel</div>
      <div style="margin-bottom: 4%">
        <div style="margin-bottom: 10px;">Booking ID: ${orderID} </div> 
        <div> Date: ${moment(created).format("DD/MM/YYYY")}</div>
      </div>
       </div>
       
       <div style="font-size: 3em; 
       background-color: #004b8d;
color: aliceblue;
padding: 0 4%;height:8vh; margin-top:40px">INVOICE</div>
</div>
      <hr/>
      
      <div style="display:flex;
padding: 0 8%;
margin: 5% 0">
    <div style="width:35%">
      <div style="font-weight:600; margin-bottom: 10px">Bill from:  </div>
      <div style="margin-bottom: 10px;">Bird Travel</div>
         <div style="margin-bottom: 10px;">Lot E2a-7, D1 Street, Đ. D1, Long Thanh My, Thu Duc city, Ho Chi Minh city</div>
      <div >02873005588</div>
    </div>
    
    <div style="width:35%; margin-left:150px">
      <div style="font-weight:600; margin-bottom: 10px">Bill to:  </div>
      <div style="margin-bottom: 10px;">${customerInfo.name}</div>
        <div style="margin-bottom: 10px;">${customerInfo.address}</div>
      <div >${customerInfo.phone}</div>
    </div>
    </div>
    
    <hr/>
    
    <div style="padding: 0 6%; margin-top: 5%">
      <table style="font-family: arial, sans-serif;
border-collapse: collapse;
width: 100%;">
<tr style="border-bottom: 1px solid gray">
<th style=" text-align: left;
padding: 8px;">Item</th>
<th style=" text-align: right;
padding: 8px;">Value</th>
<th style=" text-align: right;
padding: 8px;">Amount</th>
</tr>

<tr style="background-color: #dddddd;">
<td style=" text-align: left;
padding:15px 8px;">Distance</td>
<td style=" text-align: right;
padding:15px 8px;">${costSummary.distance.toFixed(1)} Km</td>
<td style=" text-align: right;
padding:15px 8px;">${new Intl.NumberFormat().format(
      costSummary.initCost
    )} VND</td>
</tr>
<tr >
<td style=" text-align: left;
padding:15px 8px;">Additional Bird</td>
<td style=" text-align: right;
padding:15px 8px;">${costSummary.extraBird}</td>
<td style=" text-align: right;
padding:15px 8px;">${new Intl.NumberFormat().format(
      costSummary.extraBirdCost
    )} VND</td>
</tr>
<tr style="background-color: #dddddd;">
<td style=" text-align: left;
padding:15px 8px;">Capacity Unit</td>
<td style=" text-align: right;
padding:15px 8px;">${costSummary.capacityUnit}</td>
<td style=" text-align: right;
padding:15px 8px;">${new Intl.NumberFormat().format(
      costSummary.unitCost
    )} VND</td>
</tr>
<tr>
<td style=" text-align: left;
padding:15px 8px;">Package</td>
<td style=" text-align: right;
padding:15px 8px;">${costSummary.packageName}</td>
<td style=" text-align: right;
padding:15px 8px;">${new Intl.NumberFormat().format(
      costSummary.packageCost
    )} VND</td>
</tr>
</tr>
<tr style="border-bottom: 1px solid gray; background-color: #07a;
color: aliceblue;">
<td style=" text-align: left;
padding: 20px; text-align:center; font-size: 1.3em; font-weight:600" colSpan="2">Total</td>
<td style=" text-align: right;
padding: 8px;">${new Intl.NumberFormat().format(costSummary.totalCost)} VND</td>
</tr>
</tr>
</table>
</div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      throw new AppError(SEND_EMAIL_FAIL, "Email not sent.", 200);
    } else console.log("Email sent: ", info.response);
  });

  res.status(200).json({
    DT: null,
    EC: 0,
    EM: "Check your email for invoice.",
  });
};

module.exports = {
  postNewOrder,
  getAllCage,
  getAllPackage,
  getAllPayment,
  getTotalCost,
  getCustomerByAccount,
  sendBill,
};
