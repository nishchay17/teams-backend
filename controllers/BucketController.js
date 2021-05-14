const formidable = require("formidable");
const fs = require("fs");

const BucketItem = require("../models/BucketItem");
const { uploadFile, deleteFile } = require("../util/files");

exports.upload = async (req, res) => {
  const form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(200).json({
        status: false,
        error: "something went wrong",
      });
    }
    const { name, description, tags } = fields;
    const upload = {
      data: fs.readFileSync(file.file.path),
      name: file.file.name,
    };
    uploadFile(upload, (err, file) => {
      if (err) {
        return res.json({ status: false, message: "Failed to upload" });
      }
      try {
        const item = new BucketItem({
          name,
          description,
          tags,
          uploadedBy: req.user.id,
          file: file.Location,
        });
        item.save();
        res.json({ status: true, item });
      } catch (err) {
        res.status(500).json({
          status: false,
          message: "Server Error",
        });
      }
    });
  });
};

exports.getAll = async (req, res) => {
  try {
    const bucketItems = await BucketItem.find({}).populate("uploadedBy", {
      name: 1,
    });
    res.json({
      status: true,
      bucketItems,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const bucketItem = await BucketItem.findById(id).populate("uploadedBy", {
      name: 1,
    });
    res.json({
      status: true,
      bucketItem,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.deleteById = async (req, res) => {
  const { id } = req.params;
  try {
    const bucketItem = await BucketItem.findByIdAndDelete(id);

    deleteFile(bucketItem.file, (err, data) => {
      res.json({
        status: true,
        bucketItem,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};
