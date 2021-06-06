const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const bucketItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      require: true,
    },
    fileData: {
      data: Buffer,
      contentType: String,
    },
    tags: {
      type: String,
      require: true,
    },
    uploadedBy: {
      type: ObjectId,
      ref: "User",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const BucketItem = mongoose.model("BucketItem", bucketItemSchema);

module.exports = BucketItem;
