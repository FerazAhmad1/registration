const bodyParser = require("body-parser");
const userRouter = require("./routes/user.js");
const { rateLimit } = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const helmet = require("helmet");
const express = require("express");
const app = express();
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "To many request from this IP,Please try agian after 1 hour",
});
app.use("/api", limiter);
app.use(helmet());
app.use(bodyParser.json({ limit: "10kb" }));

// Data sanitization against Nosql query injection
app.use(mongoSanitize());

// Data sanitization  against xss
app.use(xssClean());
// app.use((req, res, next) => {
//   console.log("ggggggggggggggggg", req);
//   next();
// });

app.use("/api/v1/users", userRouter);
module.exports = app;
