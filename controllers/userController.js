const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { getRandomNumber, getJoiningID } = require("../util/random");

/**
 * @name  signup
 * @route  api/user/signup
 * @description  populates remaining fields of user
 * @body  name, password, phoneNumber, joiningId
 */
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { name, password, phoneNumber, joiningId } = req.body;

  try {
    const user = await User.findOne({ joiningId });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Joining Id is wrong",
      });
    }
    if (user.name) {
      // if name is already there that means that the user is already registered
      return res.status(400).json({
        status: false,
        message: "User already resister",
      });
    }

    const firstname = name.split(" ")[0]; // this will get the first name
    const organizationName = "teams";
    const random = getRandomNumber(100, 200);

    const employeeId = firstname + "-" + organizationName + "-" + random;
    const salt = await bcrypt.genSalt(10);
    const encPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        name,
        password: encPassword,
        phoneNumber,
        employeeId,
      },
      { new: true }
    );

    const payload = {
      user: {
        id: updatedUser.id,
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
 * @body  userId, which is populated by withAuth middleware
 */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // .populate("taskAssigned")
    // .populate("taskInProgress")
    // .populate("taskCompleted");

    /**
     * @todo populate other fields
     */

    user.password = undefined;
    user.joiningId = undefined;
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

/**
 * @name  createUser
 * @route  api/user/create-user
 * @description  create a new user and generates the joining ID
 * @body  email
 */
exports.createUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: false,
        message: "User Already Exists!",
        joiningId: user.joiningId,
      });
    }

    const joiningId = getJoiningID();

    /**
     * @todo email this joining id to the new user
     */

    user = new User({
      joiningId,
      email,
      organization: "teams",
    });

    await user.save();

    res.json({
      status: true,
      joiningId,
    });
  } catch (e) {
    res.send({
      status: false,
      message: "Error in Fetching user",
    });
  }
};
