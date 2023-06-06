import AppError from "../custom/AppError";

const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    setTimeout(() => {
      return res.status(error.statusCode).json({
        DT: null,
        EC: error.errorCode,
        EM: error.message,
      });
    }, error.delay);
  } else
    return res.status(200).json({
      DT: null,
      EC: -999,
      EM: "Internal Server Error",
    });
};

module.exports = errorHandler;
