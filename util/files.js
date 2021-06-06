const AWS = require("aws-sdk");

exports.uploadFile = (file, callback) => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const s3 = new AWS.S3();

  const params = {
    Bucket: "teams-manage",
    Body: file.data,
    Key: "bucket/" + Date.now() + "_" + file.name,
    ACL: "public-read",
  };

  s3.upload(params, callback);
};

exports.deleteFile = (key, callback) => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const s3 = new AWS.S3();

  const params = {
    Bucket: "teams-manage",
    Key: key,
  };

  s3.deleteObject(params, callback);
};
