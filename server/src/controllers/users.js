const jwt = require("jsonwebtoken");
const fs = require("fs");

const User = require("../models/users");
const dev = require("../config");
const {
  securePassword,
  comparePassword,
} = require("../helpers/bcryptPassword");
const { sendEmailWithNodeMailer } = require("../helpers/email");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.fields;
    const { avatar } = req.files;

    // check that form fields are not empty
    if (!name || !email || !password || !phone) {
      return res.status(404).json({
        message: "name, email, password or phone is missing",
      });
    }

    // check password length
    if (password.length < 6) {
      return res.status(404).json({
        message: "min length for password is 6",
      });
    }

    // check that image size does not exit 1MB
    if (avatar && avatar.size > 1000000) {
      return res.status(404).json({
        message: "Max size of image is 1MB",
      });
    }

    // check that user email does not exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        message: "User already with this email",
      });
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

    res.status(201).json({
      message: "A verification link has been sent to your email",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(404).json({
        message: "token is missing",
      });
    }
    jwt.verify(token, dev.app.jwtSecretKey, async function (err, decoded) {
      if (err) {
        return res.status(401).json({
          message: "Token has expired, please register again",
        });
      }

      const { name, email, hashedPassword, avatar, phone } = decoded;

      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(400).json({
          message: "User already with this email",
        });
      }

      // create the user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        is_verified: 1,
      });

      if (avatar) {
        newUser.avatar.contentType = avatar.type;
        newUser.avatar.data = fs.readFileSync(avatar.path);
      }

      // save the user
      const user = await newUser.save();

      if (!user) {
        return res.status(400).json({
          message: "User was not created",
        });
      }

      res.status(201).json({
        message: "User was created. Ready to sign in",
      });
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check that form fields are not empty
    if (!email || !password) {
      return res.status(404).json({
        message: "Email or password is missing",
      });
    }

    // check that user email exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "user with this email does not exist. Please register.",
      });
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "email/password mismatched",
      });
    }

    // create session for user
    req.session.userId = user._id;
    console.log();

    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
const logoutUser = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("user_session");
    res.status(200).json({
      ok: true,
      message: "Logout successful",
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const userProfile = async (req, res) => {
  const userData = await User.findById(req.session.userId, { password: 0 });
  try {
    res.status(200).json({
      ok: true,
      message: "Returns User Profile",
      userData,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.session.userId);
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedData = await User.findByIdAndUpdate(
      req.session.userId,
      { ...req.fields },
      { new: true }
    );

    if(!updatedData) {
      return res.status(400).json({
        ok: false,
        message: "User was not updated",
      });
    }

    if(req.files.avatar) {
      const { avatar } = req.files;
      updatedData.avatar.contentType = avatar.type;
      updatedData.avatar.data = fs.readFileSync(avatar.path);
    }

    await updatedData.save();

    res.status(200).json({
      ok: true,
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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
};
