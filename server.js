const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const app = require("./app.js");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((connection) => connection)
  .catch((err) => console.log(err.message));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
