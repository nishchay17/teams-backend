const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    joiningId: {
      type: String,
      require: true,
    },
    employeeId: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    organization: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
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

module.exports = mongoose.model("User", UserSchema);
