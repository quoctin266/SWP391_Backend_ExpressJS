import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND, SEND_EMAIL_FAIL } from "../utils/errorCodes";
import AppError from "../custom/AppError";
import moment from "moment";
import transporter from "../services/sendGmail";

const getAllService = async (req, res, next) => {
  const [rows] = await connection.execute(
    "SELECT * FROM `service` where deleted = false"
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "No records were found.", 200);
  }

  const resData = _.chain(rows)
    // Group the elements of Array based on `title` property
    .groupBy("title")
    // `key` is group's name (title), `value` is the array of objects
    .map((value, key) => {
      value.forEach((item) => {
        delete item.title;
      });
      return { title: key, description: value };
    })
    .value();

  res.status(200).json({
    DT: resData,
    EC: 0,
    EM: "Fetch list successfully.",
  });
};

const postCreateMail = async (req, res, next) => {
  let { name, senderMail, phone, note, receiverMail, title } = req.body;

  if (receiverMail) {
    const [rows] = await connection.execute(
      "SELECT * FROM `account` WHERE email = ?",
      [receiverMail]
    );

    if (rows.length === 0) {
      const mailOptions = {
        from: senderMail,
        to: receiverMail,
        subject: title,
        html: `<div style="width: 36%;
            font-size: 1.1em;
            border: 1px solid #e5e5e5;
            border-radius: 15px;
            padding: 2%; margin: 0 auto;">
              <div style="margin: 6% 0">${note},</div>
            </div>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          throw new AppError(SEND_EMAIL_FAIL, "Email not sent.", 200);
        } else console.log("Email sent: ", info.response);
      });
    }
  }

  let currentTime = moment().format("YYYY-MM-DD HH:mm:ss").toString();

  let sql =
    "INSERT INTO `mail` (sender_name, sender_email, sender_phone, note, receiver_email, title, created_time) VALUES (?, ?, ?, ?, ?, ?, ?)";

  await connection.execute(sql, [
    name,
    senderMail,
    phone,
    note,
    receiverMail,
    title,
    currentTime,
  ]);

  res.status(200).json({ DT: null, EC: 0, EM: "Send mail successfully." });
};

const getStaffInbox = async (req, res, next) => {
  let email = req.params.email;
  const [rows] = await connection.execute(
    "SELECT * FROM `mail` WHERE receiver_email = ? OR receiver_email is null",
    [email]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Empty list.", 200);
  }

  let newRows = [];

  rows.forEach((item) => {
    if (!item.receive_deleted) newRows.push(item);
  });

  newRows.forEach((item) => {
    item.created_time = moment(item.created_time).format("MMM DD YYYY HH:mm");
  });

  res
    .status(200)
    .json({ DT: newRows, EC: 0, EM: "Fetch mail list successfully." });
};

const getAllInbox = async (req, res, next) => {
  let email = req.params.email;
  const [rows] = await connection.execute(
    "SELECT * FROM `mail` WHERE receiver_email = ? AND receive_deleted = false",
    [email]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Empty list.", 200);
  }

  rows.forEach((item) => {
    item.created_time = moment(item.created_time).format("MMM DD YYYY HH:mm");
  });

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch mail list successfully." });
};

const deleteInboxMail = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `mail` SET receive_deleted = true WHERE mail_id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Removed successfully." });
};

const getStaffTrash = async (req, res, next) => {
  let email = req.params.email;
  const [rows1] = await connection.execute(
    "SELECT * FROM `mail` WHERE receiver_email = ? OR receiver_email is null",
    [email]
  );

  let newRows = [];
  if (rows1.length > 0) {
    rows1.forEach((item) => {
      if (item.receive_deleted) newRows.push(item);
    });
  }

  const [rows2] = await connection.execute(
    "SELECT * FROM `mail` WHERE sender_email = ? AND send_deleted = true",
    [email]
  );

  newRows = [...newRows, ...rows2];

  for (const item of newRows) {
    if (item.receiver_email) {
      const [newRows2] = await connection.execute(
        "SELECT username FROM `account` WHERE email = ?",
        [item.receiver_email]
      );
      if (newRows2.length > 0) item.receiver_name = newRows2[0].username;
      else item.receiver_name = "Guest";
    } else item.receiver_name = "All Staff";
    item.created_time = moment(item.created_time).format("MMM DD YYYY HH:mm");
  }

  res
    .status(200)
    .json({ DT: newRows, EC: 0, EM: "Fetch mail list successfully." });
};

const getAllTrash = async (req, res, next) => {
  let email = req.params.email;
  const [rows1] = await connection.execute(
    "SELECT * FROM `mail` WHERE receiver_email = ? AND receive_deleted = true",
    [email]
  );

  const [rows2] = await connection.execute(
    "SELECT * FROM `mail` WHERE sender_email = ? AND send_deleted = true",
    [email]
  );

  let newRows = [...rows1, ...rows2];

  for (const item of newRows) {
    if (item.receiver_email) {
      const [newRows2] = await connection.execute(
        "SELECT username FROM `account` WHERE email = ?",
        [item.receiver_email]
      );
      if (newRows2.length > 0) item.receiver_name = newRows2[0].username;
      else item.receiver_name = "Guest";
    } else item.receiver_name = "All Staff";
    item.created_time = moment(item.created_time).format("MMM DD YYYY HH:mm");
  }

  res
    .status(200)
    .json({ DT: newRows, EC: 0, EM: "Fetch mail list successfully." });
};

const putRecoverMail = async (req, res, next) => {
  let { email, id } = req.body;

  const [rows] = await connection.execute(
    "SELECT * FROM `mail` WHERE mail_id = ?",
    [id]
  );

  if (rows[0].sender_email === email) {
    await connection.execute(
      "UPDATE `mail` SET send_deleted = false WHERE mail_id = ?",
      [id]
    );
  }

  if (rows[0].receiver_email === email || !rows[0].receiver_email) {
    await connection.execute(
      "UPDATE `mail` SET receive_deleted = false WHERE mail_id = ?",
      [id]
    );
  }

  res.status(200).json({ DT: null, EC: 0, EM: "Recover successfully." });
};

const getSentMail = async (req, res, next) => {
  let email = req.params.email;
  const [rows] = await connection.execute(
    "SELECT * FROM `mail` WHERE sender_email = ? AND send_deleted = false",
    [email]
  );

  if (rows.length === 0) {
    throw new AppError(RECORD_NOTFOUND, "Empty list.", 200);
  }

  for (const item of rows) {
    if (item.receiver_email) {
      const [newRows] = await connection.execute(
        "SELECT username FROM `account` WHERE email = ?",
        [item.receiver_email]
      );
      if (newRows.length > 0) item.receiver_name = newRows[0].username;
      else item.receiver_name = "Guest";
    } else item.receiver_name = "All Staff";
    item.created_time = moment(item.created_time).format("MMM DD YYYY HH:mm");
  }

  res
    .status(200)
    .json({ DT: rows, EC: 0, EM: "Fetch mail list successfully." });
};

const deleteSentMail = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute(
    "UPDATE `mail` SET send_deleted = true WHERE mail_id = ?",
    [id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Removed successfully." });
};

const postReplyMail = async (req, res, next) => {
  let { name, senderMail, phone, note, receiverMail, title, replyMailID } =
    req.body;

  if (receiverMail) {
    const [rows] = await connection.execute(
      "SELECT * FROM `account` WHERE email = ?",
      [receiverMail]
    );

    if (rows.length === 0) {
      const mailOptions = {
        from: senderMail,
        to: receiverMail,
        subject: title,
        html: `<div style="width: 36%;
            font-size: 1.1em;
            border: 1px solid #e5e5e5;
            border-radius: 15px;
            padding: 2%; margin: 0 auto;">
              <div style="margin: 6% 0">${note},</div>
            </div>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          throw new AppError(SEND_EMAIL_FAIL, "Email not sent.", 200);
        } else console.log("Email sent: ", info.response);
      });
    }
  }

  let currentTime = moment().format("YYYY-MM-DD HH:mm:ss").toString();

  let sql =
    "INSERT INTO `mail` (sender_name, sender_email, sender_phone, note, receiver_email, title, created_time) VALUES (?, ?, ?, ?, ?, ?, ?)";

  await connection.execute(sql, [
    name,
    senderMail,
    phone,
    note,
    receiverMail,
    title,
    currentTime,
  ]);

  await connection.execute(
    "UPDATE `mail` SET replied = true WHERE mail_id = ?",
    [replyMailID]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Reply mail successfully." });
};

module.exports = {
  getAllService,
  postCreateMail,
  getStaffInbox,
  deleteInboxMail,
  getStaffTrash,
  putRecoverMail,
  getSentMail,
  deleteSentMail,
  getAllInbox,
  getAllTrash,
  postReplyMail,
};
