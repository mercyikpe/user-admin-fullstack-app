const formidable = require("express-formidable");
const session = require("express-session");
const userRouter = require("express").Router();

const dev = require("../config");

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  userProfile,
} = require("../controllers/users");
const { isLoggedIn, isLoggedOut} = require("../middlewares/auth");

// create session
userRouter.use(
  session({
    name: "user_session",
    secret: dev.app.sessionSecretKey || "ubongmike",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
  })
);

userRouter.post("/register", formidable(), registerUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/login", isLoggedOut, loginUser);
userRouter.get("/logout", logoutUser);
userRouter.get("/profile", isLoggedIn, userProfile);

module.exports = userRouter;
