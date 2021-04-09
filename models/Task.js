const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

/**
 * @name status
 * @type number
 * @description
 *      0 ->  Assigned
 *      1 ->  In progress
 *      2 ->  Completed
 */

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
    },
    assignedDate: {
      type: Date,
      required: true,
    },
    inProgressDate: {
      type: Date,
      required: true,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    assignedBy: {
      type: ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Tasks = mongoose.model("Task", taskSchema);

module.exports = Tasks;
