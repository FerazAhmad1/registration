const bodyParser = require("body-parser");
const userRouter = require("./routes/user.js");
const express = require("express");
const app = express();
app.use(bodyParser.json());
// app.use((req, res, next) => {
//   console.log("ggggggggggggggggg", req);
//   next();
// });

app.use("/api/v1/users", userRouter);
module.exports = app;
