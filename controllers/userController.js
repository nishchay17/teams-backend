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
    return res.status(200).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { name, password, phoneNumber, joiningId } = req.body;

  try {
    const user = await User.findOne({ joiningId });

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "Joining Id is wrong",
      });
    }
    if (user.name) {
      // if name is already there that means that the user is already registered
      return res.status(200).json({
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
          isAdmin: user.isAdmin,
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
      return res.status(200).json({
        status: false,
        message: "User Not Exist",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(200).json({
        status: false,
        message: "Invalid credentials",
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
          isAdmin: user.isAdmin,
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
    const user = await User.findById(req.user.id).populate([
      {
        path: "taskAssigned",
        model: "Task",
        populate: {
          path: "assignedBy",
          model: "User",
          select: "email name",
        },
      },
      {
        path: "taskInProgress",
        model: "Task",
        populate: {
          path: "assignedBy",
          model: "User",
          select: "email name",
        },
      },
      {
        path: "taskCompleted",
        model: "Task",
        populate: {
          path: "assignedBy",
          model: "User",
          select: "email name",
        },
      },
    ]);

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
 * @name  getUserByEmployeeId
 * @route  api/user/employeeId
 * @description  gets user's information by employeeId
 * @body  employeeId
 */
exports.getUserByEmployeeId = async (req, res) => {
  const { employeeId } = req.body;
  try {
    const user = await User.find({ employeeId })
      .populate("taskAssigned")
      .populate("taskInProgress")
      .populate("taskCompleted");

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
      return res.status(200).json({
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

    res.status(200).json({
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

/**
 * @name  updatePassword
 * @route  api/user/update-password
 * @description  updates user password
 * @body  oldPassword, password
 */
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { oldPassword, password } = req.body;
  const id = req.user.id;
  console.log({ oldPassword, password, id });
  try {
    const user = await User.findById(id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(200).json({
        status: false,
        message: "Incorrect Password!",
      });
    const salt = await bcrypt.genSalt(10);
    const encPassword = await bcrypt.hash(password, salt);
    await User.findByIdAndUpdate(id, { password: encPassword });

    res.status(200).json({
      status: true,
      message: "Password updated successful",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

/**
 * @name  makeAdmin
 * @route  api/user/make-admin
 * @description  marks user admin
 * @body  employeeId
 */
exports.makeAdmin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { employeeId } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { employeeId },
      { isAdmin: true },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "User in now admin",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.isJoiningIdExists = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { joiningId } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ joiningId });

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "Joining Id is wrong",
      });
    }
    if (user.name) {
      return res.status(200).json({
        status: false,
        message: "User already resister",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "Joining Id is correct",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { name: { $exists: true } },
      { isDeleted: 0, password: 0 }
    )
      .populate("taskAssigned")
      .populate("taskInProgress")
      .populate("taskCompleted");

    res.status(200).json({
      status: true,
      users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "user deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};
