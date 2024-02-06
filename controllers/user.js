const User = require("../models/user.js");
const resetPasswordHtml = require("../utils/resetpassword.js");
const sendMail = require("../utils/email.js");
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

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new error("please provide email");
    }
    // 1) Get user based on posted email;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User Does not exist");
    }

    // 2). create random token for reset password

    const randomToken = user.createRandomToken();
    const resetLink = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetpassword/${randomToken}`;
    // const message = `forgot your password?submit a patch request with your new password and password confirm to reset URL ${link}.\n if you dont forgot your password just ignore this mail`;
    console.log(resetLink);
    // send email

    const result = await sendMail({
      sender: "ferazkhan4@gmail.com",
      email: [user.email],
      subject: "your password reset mail",
      htmlcontent: `<p>Please click the following link to reset your password:</p>`,
      resetLink,
      resetPasswordHtml,
    });
    if (result.rejected.length === 0) {
      res.status(250).json({
        success: true,
        message:
          "Password reset request has been processed successfully. Please check your email for further instructions.",
      });
    }
  } catch (error) {
    res.status(401).json({
      status: "Fail",
      message: error.message,
    });
  }
};
