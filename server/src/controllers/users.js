const jwt = require("jsonwebtoken");

const User = require("../models/users");
const dev = require("../config");
const { securePassword } = require("../helpers/bcryptPassword");
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
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
      <h2>Hello ${name}</h2>
      <p>Please click <a href="${dev.app.clientUrl}/api/users/activate/${token}" target="_blank">here to activate your account</a></p>
      `, // html body
    };

    sendEmailWithNodeMailer(emailData);

    res.status(201).json({
      message: "user is created",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      stackTrace: err.stackTrace,
    });
  }
};

module.exports = { registerUser };
