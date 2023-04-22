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
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.log(error);
    return error
  }
};

module.exports = { securePassword, comparePassword };

// const hashedPassword = await securePassword(password)
