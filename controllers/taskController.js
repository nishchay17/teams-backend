const { validationResult } = require("express-validator");
const formidable = require("formidable");
const fs = require("fs");

const Task = require("../models/Task");
const User = require("../models/User");
const { uploadFile } = require("../util/files");

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
    const user = await User.findById(assignedTo);

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
 * @name  createV2
 * @route  api/task/create/v2
 * @description  create new task with file (version 2)
 * @body   name, description, assignedTo, file
 */
exports.createTaskV2 = async (req, res) => {
  const form = formidable.IncomingForm();
  form.keepExtensions = true;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(200).json({
        status: false,
        error: "something went wrong",
      });
    }
    const { name, description, assignedTo } = fields;

    const user = await User.findById(assignedTo);

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "Can not find the user",
      });
    }

    const task = new Task({
      name,
      description,
      assignedTo: user._id,
      assignedDate: new Date(),
      status: 0,
      assignedBy: req.user.id,
    });
    if (file.file) {
      task.fileData.data = fs.readFileSync(file.file.path);
      task.fileData.contentType = file.file.type;
    }
    await task.save();

    await User.findByIdAndUpdate(user._id, {
      $push: { taskAssigned: task._id },
    });

    res.status(200).json({
      status: true,
      message: "task created",
    });
  });
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

/**
 * @name  editTask
 * @route  api/task/edit/:id
 * @description  creates task
 */
exports.editTask = async (req, res) => {
  const { name, description } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  const { id } = req.params;

  try {
    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });

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
 * @name  deleteTask
 * @route  api/task/delete/:id
 * @description  delete task
 */
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.status(200).json({
      status: true,
      message: "deleted",
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
 * @name  getTaskById
 * @route  api/task/get/:id
 * @description  get task by ID
 */
exports.getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id)
      .populate("assignedBy", { name: true })
      .populate("assignedTo", { name: true });
    if (task === null) {
      return res.status(200).json({
        status: false,
        message: "Not found",
      });
    }
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

exports.photo = async (req, res, next) => {
  try {
    const item = await Task.findById(req.params.id);
    if (item.fileData) {
      res.set("Content-type", item.fileData.contentType);
      return res.send(item.fileData.data);
    } else {
      return res.status(200).json({
        status: false,
        message: "not found",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: false,
    });
  }
};
