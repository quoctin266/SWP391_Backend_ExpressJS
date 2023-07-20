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
  let { title, subtitle, intro, conclusion, banner, sectionList } = req.body;
  let sql =
    "INSERT INTO `news` (title, sub_title, banner, intro, conclusion) VALUES (?, ?, ?, ?, ?)";

  const [rows] = await connection.execute(sql, [
    title,
    subtitle,
    banner,
    intro,
    conclusion,
  ]);

  for (const section of sectionList) {
    await connection.execute(
      "INSERT INTO `news_content` (content_title, content_body, news_id) VALUES (?, ?, ?)",
      [section.title, section.content, rows.insertId]
    );
  }

  res
    .status(200)
    .json({ DT: null, EC: 0, EM: "Article created successfully." });
};

const putUpdateArticle = async (req, res, next) => {
  let { title, subtitle, intro, conclusion, banner, sectionList, id } =
    req.body;

  await connection.execute(
    "UPDATE `news` SET title = ?, sub_title = ?, banner = ?, intro = ?, conclusion = ? WHERE id = ?",
    [title, subtitle, banner, intro, conclusion, id]
  );

  await connection.execute("DELETE FROM `news_content` WHERE news_id = ?", [
    id,
  ]);

  for (const section of sectionList) {
    await connection.execute(
      "INSERT INTO `news_content` (content_title, content_body, news_id) VALUES (?, ?, ?)",
      [section.title, section.content, id]
    );
  }

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
