const express = require("express");

const {
  upload,
  getAll,
  getById,
  deleteById,
  photo,
} = require("../controllers/BucketController");
const { withAuth } = require("../middleware/auth");
const router = express.Router();

router.post("/upload", withAuth, upload);

router.get("/file/:id", photo);

router.get("/get-all", withAuth, getAll);

router.get("/get/:id", withAuth, getById);

router.delete("/delete/:id", withAuth, deleteById);

module.exports = router;
