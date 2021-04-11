const { validationResult } = require("express-validator");

const Task = require("../models/Task");
const User = require("../models/User");

/**
 * @name  create
 * @route  api/task/create
 * @description  create new task
 * @body   name, description, assignedTo
 */
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { name, description, assignedTo } = req.body;

  try {
    const user = await User.findOne({ employeeId: assignedTo });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Can not find the user",
      });
    }
    console.log(user);
    console.log({ name, description, assignedTo });

    const task = new Task({
      name,
      description,
      assignedTo: user._id,
      assignedDate: new Date(),
      status: 0,
      assignedBy: req.user.id,
    });

    await task.save();

    await User.findByIdAndUpdate(user._id, {
      $push: { taskAssigned: task._id },
    });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

/**
 * @name  taskInProcess
 * @route  api/task/inProcess/:id
 * @description  updates status to 1
 */
exports.taskInProcess = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { status: 1, inProgressDate: new Date() },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(req.user.id, {
      $pull: { taskAssigned: id, taskCompleted: id },
      $addToSet: { taskInProgress: id },
    });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

/**
 * @name  taskIsCompleted
 * @route  api/task/inProcess/:id
 * @description  updates status to 2
 */
exports.taskIsCompleted = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { status: 2, completionDate: new Date() },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(req.user.id, {
      $pull: { taskAssigned: id, taskInProgress: id },
      $addToSet: { taskCompleted: id },
    });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

/**
 * @name  taskIsAssigned
 * @route  api/task/isAssigned/:id
 * @description  updates status to 0
 */
exports.taskIsAssigned = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndUpdate(id, { status: 0 }, { new: true });

    const user = await User.findByIdAndUpdate(req.user.id, {
      $pull: { taskCompleted: id, taskInProgress: id },
      $addToSet: { taskAssigned: id },
    });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};
