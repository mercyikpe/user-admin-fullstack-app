const jwt = require("jsonwebtoken");

const User = require("../models/users");
const dev = require("../config");
const { comparePassword } = require("../helpers/bcryptPassword");
const {
  errorResponse,
  successResponse,
} = require("../helpers/responseHandlers");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check that form fields are not empty
    if (!email || !password) {
      errorResponse(res, 404, "email or password not found");
    }

    // check that user email exist
    const user = await User.findOne({ email });
    if (!user) {
      errorResponse(
        res,
        404,
        "user with this email does not exist. Please register"
      );
    }

    // isAdmin
    if (user.is_admin === 0) {
      errorResponse(res, 404, "Not an admin");
    }

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "email/password mismatched",
      });
    }

    // create session for user
    req.session.userId = user._id;

    // errorResponse(res, 404, "Not an admin");
    // successResponse(res, 200, "Login successful")
    res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const logoutAdmin = async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie("admin_session");
    res.status(200).json({
      ok: true,
      message: "Logout successful",
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      is_admin: 0,
    });
    res.status(200).json({
      ok: true,
      message: "Returned all users",
      users,
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    // fetch an id of a user
    const { id } = req.params;
    const findUser = await User.findById(id);
    if (!findUser) errorResponse(res, 404, "user not found with this id");

    await User.findByIdAndDelete(id);
    successResponse(res, 200, "user deleted successfully");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    // fetch the id of a user
    const { id } = req.params;
    // find user to update by id
    const updatedData = await User.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!updatedData) errorResponse(res, 404, "user not found with this id");

    await updatedData.save();

    if (!updatedData) {
      errorResponse(res, 400, "User was not updated");
    }

    successResponse(res, 200, "user updated successfully");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
};
