import connection from "../config/connectDB";
import _ from "lodash";
import { RECORD_NOTFOUND } from "../utils/errorCodes";
import AppError from "../custom/AppError";

const postCreateFAQ = async (req, res, next) => {
  let { question, answer } = req.body;
  let sql = "INSERT INTO `faq` (question, answer) VALUES (?, ?)";

  await connection.execute(sql, [question, answer]);

  res.status(200).json({ DT: null, EC: 0, EM: "QA created successfully." });
};

const putUpdateFAQ = async (req, res, next) => {
  let { question, answer, id } = req.body;

  await connection.execute(
    "UPDATE `faq` SET question = ?, answer = ? WHERE id = ?",
    [question, answer, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deleteFAQ = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute("UPDATE `faq` SET deleted = true WHERE id = ?", [
    id,
  ]);

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

const postCreateArticle = async (req, res, next) => {
  let { title, source, date, link } = req.body;
  let sql =
    "INSERT INTO `news` (title, source, date, link) VALUES (?, ?, ?, ?)";

  await connection.execute(sql, [title, source, date, link]);

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Article created successfully." });
};

const putUpdateArticle = async (req, res, next) => {
  let { title, source, date, link, id } = req.body;

  await connection.execute(
    "UPDATE `news` SET title = ?, source = ?, date = ?, link = ? WHERE id = ?",
    [title, source, date, link, id]
  );

  res.status(200).json({ DT: null, EC: 0, EM: "Update successfully." });
};

const deleteArticle = async (req, res, next) => {
  let id = req.params.id;

  await connection.execute("UPDATE `news` SET deleted = true WHERE id = ?", [
    id,
  ]);

  res.status(200).json({ DT: null, EC: 0, EM: "Deleted successfully." });
};

module.exports = {
  postCreateFAQ,
  putUpdateFAQ,
  deleteFAQ,
  postCreateArticle,
  putUpdateArticle,
  deleteArticle,
};
