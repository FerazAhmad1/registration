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
    const { name, image, email, password } = req.body;
    const response = await User.create({
      name,
      email,
      image,
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

    try {
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
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      user.save({ validateBeforeSave: false });
      res.status(500).json({
        status: "fail",
        message: "there was an error sending the mail please try again later",
      });
    }
  } catch (error) {
    res.status(401).json({
      status: "Fail",
      message: error.message,
    });
  }
};

exports.resetPaswword = async (req, res, next) => {
  console.log("inside rhe conrtroller");
  try {
    // 1) First encrypt the token

    const hashtoken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    if (!hashtoken) {
      throw new Error("Invalid user");
    }

    // 2). Find user on the basis of token if user is available set the new password

    const user = await User.findOne({
      passwordResetToken: hashtoken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid user");
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    // 3) Update the changePasswordAt (before save document , document pre save middleware run automatically)

    // 4) give the login access

    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      message: error.message,
    });
  }
};

// {
//   active: true,
//     currentUserEmail: "ferazaaahmad62@gmail.com",
//     updateUser:"ferazkhan4@gmail.com"

// }
exports.activate = async (req, res, next) => {
  const { active } = req.body;
  try {
    const { currentUserEmail } = req.body;
    try {
      const currentUser = await User.findOne({ email: currentUserEmail });
      if (currentUser.role !== "admin") {
        throw new Error("you are not authorize to perform this action");
      }
    } catch (error) {
      error.statusCode = 401;
      throw error;
    }

    try {
      if (active === undefined) {
        throw new Error("Please give the valuee  of active");
      }
    } catch (error) {
      error.statusCode = 400;
      throw error;
    }

    try {
      const { updateUser } = req.body;
      const updatedUser = await User.findOneAndUpdate(
        { email: updateUser },
        { active },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("this user does not exist ");
      }
      res.status(200).json({
        status: "success",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    res.status(error.statusCode).json({
      status: "Fail",
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res, next) => {
  const { name, email, image } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, image },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Fail",
      message: "internal server error",
    });
  }
};
