const bcrypt = require("bcrypt");
const saltRounds = 10;

const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.log(error);
    return error
  }
};

module.exports = { securePassword };

// const hashedPassword = await securePassword(password)
