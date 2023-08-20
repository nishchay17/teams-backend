const formidable = require("formidable");
const fs = require("fs");

const BucketItem = require("../models/BucketItem");
const { uploadFile, deleteFile } = require("../util/files");
const cloudinary = require("../util/cloudinary");

exports.upload = async (req, res) => {
  const { name, description } = req.body;

  if (req.file === undefined) {
    return res.status(200).json({
      status: false,
      message: "file not found",
    });
  }

  if (req?.file.size > 10485760) {
    //10mb in bytes
    return res.status(200).json({
      status: false,
      message: "file is too big",
    });
  }

  try {
    let result;
    try {
      result = await cloudinary().uploader.upload(req.file.path, { folder: "teams/bucket" });
    } catch (e) {
      return res.status(400).json({
        status: false,
        message: e.message
      })
    }
    let item = new BucketItem({
      name,
      description,
      tags: "",
      uploadedBy: req.user.id,
      file: result.url
    });
    await item.save();
    res.json({ status: true, message: "item created" });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getAll = async (req, res) => {
  const { pageNo = 0, perPage = 16 } = req.query;
  try {
    const bucketItems = await BucketItem
      .find({})
      .limit(+perPage)
      .skip(perPage * pageNo)
      .sort({ createdAt: 'desc' })
      .populate("uploadedBy", {
        name: 1,
      });
    const count = await BucketItem.countDocuments({})
    res.json({
      status: true,
      bucketItems,
      pagination: {
        size: perPage,
        pageNo,
        count
      },
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
    await BucketItem.findByIdAndDelete(id);
    res.json({
      status: true,
      message: "bucket item deleted successfully",
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
