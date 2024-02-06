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
  const { email, password } = req.body;
  console.log(email);
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
};
