const express = require("express");
const router = express.Router();
const { check } = require("express-validator/check");

const { createUser, login, me } = require("../controllers/userController");
const { withAuth } = require("../middleware/withAuth");

/**
 * @method  POST
 * @route  api/user/signup
 * @description  user sign-up
 */
router.post(
  "/signup",
  [
    check("name", "Please Enter a Valid name"),
    check("email", "Please enter a valid email").isEmail(),
    check("phoneNumber", "Please enter a valid phone number"),
    check("Password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  createUser
);

/**
 * @method  POST
 * @route  api/user/login
 * @description  user log-in
 */
router.post(
  "/login",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  login
);

/**
 * @method  GET
 * @description  Get LoggedIn User
 * @param  /user/me
 * @protected
 */
router.get("/me", withAuth, me);

module.exports = router;
