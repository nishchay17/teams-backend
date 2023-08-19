const { validationResult } = require("express-validator");

const Task = require("../models/Task");
const User = require("../models/User");
const cloudinary = require("../util/cloudinary");

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  const { name, description, assignedTo, priority } = req.body;
  const user = await User.findById(assignedTo);

  if (!user) {
    return res.status(200).json({
      status: false,
      message: "Can't find the user",
    });
  }

  try {
    let result;
    if (req.file?.path) {
      result = await cloudinary().uploader.upload(req.file.path, { folder: "teams" });
    }
    const task = new Task({
      name,
      description,
      assignedTo: user._id,
      assignedDate: new Date(),
      status: 0,
      assignedBy: req.user.id,
      file: result?.url,
      priority
    });
    await task.save();
    await User.findByIdAndUpdate(user._id, {
      $push: { taskAssigned: task._id },
    });
    res.status(200).json({
      status: true,
      message: "Task created successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ status: false, message: "Internal server error" });
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

/**
 * @name  editTask
 * @route  api/task/edit/:id
 * @description  creates task
 */
exports.editTask = async (req, res) => {
  const { name, description, assignedTo, priority } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (priority) updateData.priority = priority;
  const { id } = req.params;
  if (!!assignedTo) {
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "Can't find the user",
      });
    }
    updateData.assignedTo = user._id
  }
  let result;
  if (req.file?.path) {
    result = await cloudinary().uploader.upload(req.file.path, { folder: "teams" });
  }
  updateData.file = result?.url
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
      message: "task deleted successfully",
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

/**
 * @name  getArchivedTask
 * @route  api/task/archive
 * @description  get archived task
 */
exports.getArchivedTask = async (req, res) => {
  const { pageNo = 0, perPage = 10 } = req.query;
  try {
    const tasks = await Task.find({ isArchived: true })
      .limit(+perPage)
      .skip(perPage * pageNo)
      .sort({ updatedAt: 'desc' })
      .populate("assignedBy", { name: true })
      .populate("assignedTo", { name: true });
    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No tasks found",
      });
    }
    const count = await Task.countDocuments({ isArchived: true })
    return res.status(200).json({
      status: true,
      tasks,
      pagination: {
        size: perPage,
        pageNo,
        count
      },
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server error",
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

exports.archiveTask = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = { isArchived: true }
    await Task.findByIdAndUpdate(id, updateData);
    res.status(200).json({
      status: true,
      message: "task archived",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server Error in here bro",
    });
  }
}