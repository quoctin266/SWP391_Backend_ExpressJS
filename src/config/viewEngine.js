import express from "express";

const configViewEngine = (app) => {
  //config view engine
  app.set("views", "./src/views");
  app.set("view engine", "ejs");

  //config public assets
  app.use(express.static("./src/public"));
};

module.exports = configViewEngine;
