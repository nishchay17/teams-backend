const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  signup,
  login,
  me,
  createUser,
} = require("../controllers/userController");
const { withAuth, withAdmin } = require("../middleware/auth");

/**
 * @method  POST
 * @route  api/user/signup
 * @description  user sign-up
 */
router.post(
  "/signup",
  [
    check("name", "Please Enter a Valid name"),
    check("phoneNumber", "Please enter a valid phone number"),
    check("joiningId", "Please enter joining Id"),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  signup
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
 * @route  api/user/me
 * @protected
 */
router.get("/me", withAuth, me);

/**
 * @method  POST
 * @description  creates user and give joiningId back
 * @route  api/user/me
 * @protected
 * @admin
 */
router.post(
  "/create-user",
  [check("email", "Please enter a valid email").isEmail()],
  withAuth,
  withAdmin,
  createUser
);

module.exports = router;
