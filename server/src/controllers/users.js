const jwt = require("jsonwebtoken");

const User = require("../models/users");
const dev = require("../config");
const {
  securePassword,
  comparePassword,
} = require("../helpers/bcryptPassword");
const { sendEmailWithNodeMailer } = require("../helpers/email");
const {
  errorResponse,
  successResponse,
} = require("../helpers/responseHandlers");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // const { avatar } = req.file.filename;
    const avatar = req.file && req.file.filename;

    // check that form fields are not empty
    if (!name || !email || !password || !phone) {
      errorResponse(res, 400, "name, email, password or phone is missing");
    }

    // check password length
    if (password.length < 6) {
      errorResponse(res, 400, "min length for password is 6");
    }

    // check that user email does not exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      errorResponse(res, 400, "User already with this email");
    }

    // secure the password
    const hashedPassword = await securePassword(password);

    // store the user data temporarily in jwt waiting for email verification
    const token = jwt.sign(
      { name, email, hashedPassword, phone, avatar },
      dev.app.jwtSecretKey,
      { expiresIn: "10m" }
    );

    // send verification mail with defined transport object
    // route parameter <p>Please click <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank">here to activate your account</a></p>
    const emailData = {
      email,
      subject: "Testing sending mail from backend",
      html: `
      <h2>Good Morning ${name}</h2>
      <p>Please click <a href="${dev.app.clientUrl}/api/users/activate/?token=${token}" target="_blank">here to activate your account</a></p>
      <p>Your FullStack dev in love</p>
      <p>
        <b>Mercy Ikpe. <br>
            <em>FullStack Dev</em>
        </b>  
      </p>`, // html body
    };

    await sendEmailWithNodeMailer(emailData);

    successResponse(
      res,
      201,
      "A verification link has been sent to your email",
      token
    );
  } catch (err) {
    errorResponse(res, 400, err.message);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      errorResponse(res, 404, "token is missing");
    }
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        errorResponse(res, 401, "Token has expired, please register again");
      }

      const { name, email, hashedPassword, avatar, phone } = decoded;

      const userExist = await User.findOne({ email });
      if (userExist) {
        errorResponse(res, 400, "User already with this email");
      }

      // create the user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        is_verified: true,
      });

      if (avatar) {
        newUser.avatar;
        // newUser.avatar.data = fs.readFileSync(avatar.path);
        // newUser.avatar.contentType = avatar.type;
      }

      // save the user
      const user = await newUser.save();

      if (!user) {
        errorResponse(res, 400, "User was not created");
      }

      successResponse(res, 201, "User was created. Ready to sign in");
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check that form fields are not empty
    if (!email || !password) {
      errorResponse(res, 404, "Email or password is missing");
    }

    // check that user email exist
    const user = await User.findOne({ email });
    if (!user) {
      errorResponse(
        res,
        400,
        "user with this email does not exist. Please register"
      );
    }

    if (user.is_banned) errorResponse(res, 400, "user is banned");

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) errorResponse(res, 400, "email/password mismatched");

    // create session for user
    req.session.userId = user._id;

    successResponse(res, 200, "Login successful", user(data.name, user.email));
    // res.status(200).json({
    //   message: "Login successful",
    //   user: {
    //     name: user.name,
    //     email: user.email,
    //   },
    // });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");

    successResponse(res, 200, "Logout successful");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const userProfile = async (req, res) => {
  try {
    const userData = await User.findById(req.session.userId, { password: 0 });
    successResponse(res, 200, "Returns User Profile", userData);
    // res.status(200).json({
    //   ok: true,
    //   message: "Returns User Profile",
    //   userData,
    // });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.userId);
    successResponse(res, 200, "User deleted successfully");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const hashedPassword = await securePassword(req.body.password);

    const updatedData = await User.findByIdAndUpdate(
      req.session.userId,
      { ...req.body, password: hashedPassword, avatar: req.file },
      { new: true }
    );

    await updatedData.save();

    if (!updatedData) errorResponse(res, 400, "User was not updated");

    successResponse(res, 200, "User updated successfully");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      errorResponse(res, 404, "Email or Password is empty");

    // check if user exist with the email
    const user = await User.findOne({ email });
    if (!user)
      errorResponse(res, 400, "User was not found with this email address");

    // secure the password
    const hashedPassword = await securePassword(password);

    // store the user data temporarily in jwt waiting for email verification
    const token = jwt.sign({ email, hashedPassword }, dev.app.jwtSecretKey, {
      expiresIn: "10m",
    });

    // send verification mail with defined transport object
    // route parameter <p>Please click <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank">here to activate your account</a></p>
    const emailData = {
      email,
      subject: "Reset Password",
      html: `
      <h2>Good Morning ${user.name}</h2>
      <p>Please click <a href="${dev.app.clientUrl}/api/users/reset-password/?token=${token}" target="_blank">here to reset your password</a></p>
      <p>
        <b>Mercy Ikpe. <br>
            <em>FullStack Dev</em>
        </b>  
      </p>`, // html body
    };

    await sendEmailWithNodeMailer(emailData);

    successResponse(res, 200, "An email has been sent for resetting password");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) errorResponse(res, 404, "Token is missing");

    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) errorResponse(res, 401, "Token has expired");

      const { email, hashedPassword } = decoded;

      const userExist = await User.findOne({ email });
      if (!userExist) errorResponse(res, 400, "User already with this email");

      // update the user
      const updateData = await User.updateOne(
        { email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );

      if (!updateData)
        errorResponse(res, 201, "Reset password was unsuccessful");

      successResponse(res, 201, "Reset password was successful");
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  userProfile,
  deleteUser,
  updateUser,
  forgetPassword,
  resetPassword,
};
