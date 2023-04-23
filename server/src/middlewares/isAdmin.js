const User = require("../models/users");
const { errorResponse } = require("../helpers/responseHandlers");

const isAdmin = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const id = req.session.userId;
      const adminData = await User.findById(id);
      if (adminData?.is_admin) {
        next();
      } else {
        errorResponse(res, 401, "You are not an admin");
      }
    } else {
      errorResponse(res, 401, "Please login");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { isAdmin };
