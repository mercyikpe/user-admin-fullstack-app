const userRouter = require("express").Router();
const formidable = require("express-formidable");
const { registerUser, verifyEmail, loginUser, logoutUser, userProfile} = require("../controllers/users");

userRouter.post("/register", formidable(), registerUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/login", loginUser);
userRouter.get("/logout", logoutUser);
userRouter.get("/profile", userProfile);

module.exports = userRouter;
