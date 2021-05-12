const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  signup,
  login,
  me,
  createUser,
  updatePassword,
  getUserByEmployeeId,
  makeAdmin,
  isJoiningIdExists,
} = require("../controllers/userController");
const { withAuth, withAdmin } = require("../middleware/auth");

/**
 * @todo getAllUsers
 * @todo update other fields of user
 * @todo delete users
 */

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
    check("email", "Please Email"),
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
 * @route  api/user/create-user
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

/**
 * @method  PUT
 * @description  update password
 * @route  api/user/update-password
 * @protected
 */
router.put(
  "/update-password",
  [
    check("oldPassword", "Please enter old password"),
    check("password", "Please enter password").isLength({
      min: 6,
    }),
  ],
  withAuth,
  updatePassword
);

/**
 * @method  GET
 * @description  get user by employeeId
 * @route  api/user/employeeId
 * @protected
 * @admin
 */
router.get(
  "/employeeId",
  [check("employeeId", "Please enter employee Id")],
  withAuth,
  withAdmin,
  getUserByEmployeeId
);

/**
 * @method  PUT
 * @description  make admin to given employeeId user
 * @route  api/user/make-admin
 * @protected
 * @admin
 */
router.put(
  "/make-admin",
  [check("employeeId", "Please enter employee Id")],
  withAuth,
  withAdmin,
  makeAdmin
);

/**
 * @method  POST
 * @description  check Joining Id
 * @route  api/user/check-id
 */
router.post(
  "/check-id",
  [check("employeeId", "Please enter employee Id")],
  isJoiningIdExists
);

module.exports = router;
