const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
exports.signup = async (req, res, next) => {
  try {
    const { name, image, role, email, password } = req.body;
    const response = await User.create({
      name,
      email,
      image,
      role,
      password,
    });
    const token = signToken(response._id);
    response.password = undefined;
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: response,
      },
    });
    console.log(token);
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    const user = await User.findOne({ email }).select("+password");

    // check if user have correct email and password
    if (!user || !(await user.correctpassword(password, user.password))) {
      res.status(401).json({
        status: "Fail",
        message: "unauthorized",
      });
      next();
    }

    // send jwt token and authorize user
    const token = signToken(user._id);
    const cookieOption = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };

    if (process.env.NODE_ENV === "production") {
      cookieOption.secure = true;
    }
    res.cookie("jwt", token, cookieOption);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(401).json({
      status: "Fail",
      message: error.message,
    });
  }
};
