const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { withAuth, withAdmin } = require("../middleware/auth");
const {
  createTask,
  taskInProcess,
  taskIsCompleted,
  taskIsAssigned,
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

module.exports = router;
