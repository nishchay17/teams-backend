const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { withAuth, withAdmin } = require("../middleware/auth");
const {
  editTask,
  deleteTask,
  createTask,
  getTaskById,
  taskInProcess,
  taskIsCompleted,
  taskIsAssigned,
  createTaskV2,
  photo,
} = require("../controllers/taskController");

/**
 * @method  POST
 * @route  api/task/create
 * @description  creates task
 * @protected
 * @admin
 */
router.post(
  "/create",
  [
    check("name", "Please Enter a Valid name"),
    check("description", "Please enter a valid description"),
    check("assignedTo", "Please enter joining Id"),
  ],
  withAuth,
  withAdmin,
  createTask
);
/**
 * @method  POST
 * @route  api/task/create/v2
 * @description  creates task with file
 * @protected
 * @admin
 */
router.post("/create/v2", withAuth, withAdmin, createTaskV2);

/**
 * @method  GET
 * @route  api/task/get/:id
 * @description  get task by ID
 * @protected
 */
router.get("/get/:id", withAuth, getTaskById);

/**
 * @method  PUT
 * @route  api/task/edit/:id
 * @description  edits task
 * @protected
 * @admin
 */
router.put("/edit/:id", withAuth, withAdmin, editTask);

/**
 * @method  DELETE
 * @route  api/task/delete/:id
 * @description  delete task
 * @protected
 * @admin
 */
router.delete("/delete/:id", withAuth, withAdmin, deleteTask);

/**
 * @method  GET
 * @route  api/task/inProcess/:id
 * @description  get task's status to inProcess
 * @params  id - task id that has to be updated
 * @protected
 */
router.get("/inProcess/:id", withAuth, taskInProcess);

/**
 * @method  GET
 * @route  api/task/isAssigned/:id
 * @description  get task's status to isAssigned
 * @params  id - task id that has to be updated
 * @protected
 */
router.get("/isAssigned/:id", withAuth, taskIsAssigned);

/**
 * @method  GET
 * @route  api/task/isCompleted/:id
 * @description  get task's status to isCompleted
 * @params  id - task id that has to be updated
 * @protected
 */
router.get("/isCompleted/:id", withAuth, taskIsCompleted);

/**
 * @method  GET
 * @route  api/task/file/:id
 * @description  get task's file
 * @params  id - task id
 * @protected
 */
router.get("/file/:id", withAuth, photo);

module.exports = router;
