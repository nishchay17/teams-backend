const formidable = require("formidable");
const fs = require("fs");

const BucketItem = require("../models/BucketItem");
const { uploadFile, deleteFile } = require("../util/files");

exports.upload = async (req, res) => {
  const form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(200).json({
        status: false,
        error: "something went wrong",
      });
    }
    const { name, description } = fields;

    if (file.file === undefined) {
      return res.status(200).json({
        status: false,
        message: "file not found",
      });
    }

    if (file?.file.size > 10485760) {
      //10mb in bytes
      return res.status(200).json({
        status: false,
        message: "file is too big",
      });
    }

    let item = new BucketItem({
      name,
      description,
      tags: "",
      uploadedBy: req.user.id,
    });
    item.fileData.data = fs.readFileSync(file.file.path);
    item.fileData.contentType = file.file.type;
    await item.save();

    res.json({ status: true, message: "item created" });
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

exports.photo = async (req, res, next) => {
  console.log(req.params.id);
  try {
    const item = await BucketItem.findById(req.params.id);
    res.set("Content-type", item.fileData.contentType);
    return res.send(item.fileData.data);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      status: false,
    });
  }
};
