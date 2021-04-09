const mongoose = require("mongoose");

exports.connectToDatabase = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(
      () => {
        console.log("Connected to DB");
      },
      (err) => {
        console.log("Error in connecting to DB" + err);
      }
    );
};
