const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    taskAssigned: [
      {
        type: ObjectId,
        ref: "Task",
      },
    ],
    taskInProgress: [
      {
        type: ObjectId,
        ref: "Task",
      },
    ],
    taskCompleted: [
      {
        type: ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", UserSchema);
