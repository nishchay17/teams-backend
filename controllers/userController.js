const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/User");
const { getRandomNumber } = require("../util/random");

/**
 * @name  createUser
 * @route  api/user/signup
 * @description  create user
 * @body  name, email, password, phoneNumber
 */
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { name, email, password, phoneNumber } = req.body;

  try {
    let user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).json({
        status: false,
        message: "User Already Exists!",
      });
    }

    const firstname = name.split(" ")[0]; // this will get the first name
    const organizationName = "teams";
    const random = getRandomNumber(100, 200);

    const employeeId = firstname + "-" + organizationName + "-" + random;

    user = new User({
      name,
      email,
      password,
      phoneNumber,
      organization: organizationName,
      employeeId,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.SECRET,
      {
        expiresIn: 864000, // 10 days
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          status: true,
          token,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

/**
 * @name  login
 * @route  api/user/login
 * @description  logs the users and gives JWT
 * @body  email, password
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({
      email,
    });
    if (!user)
      return res.status(400).json({
        status: false,
        message: "User Not Exist",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        status: false,
        message: "Incorrect Password !",
      });

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.SECRET,
      {
        expiresIn: 864000, // 10 days
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          status: true,
          token,
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

/**
 * @name  me
 * @route  api/user/me
 * @description  gets logged in user's information
 * @body  userId, where is populated by withAuth middleware
 */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("taskAssigned")
      .populate("taskInProgress")
      .populate("taskCompleted");

    user.password = undefined;
    user._id = undefined;
    user.organization = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;

    res.json({
      status: true,
      user,
    });
  } catch (e) {
    res.send({
      status: false,
      message: "Error in Fetching user",
    });
  }
};
