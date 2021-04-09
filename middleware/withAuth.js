const jwt = require("jsonwebtoken");

/**
 * @name  withAuth
 * @description  checks if the user in logged in or not
 * @header  token
 */
exports.withAuth = async (req, res, next) => {
  const token = req.header("token");
  if (!token)
    return res
      .status(401)
      .json({ status: false, message: "Token expired or is worng" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: true, message: "Invalid Token" });
  }
};
