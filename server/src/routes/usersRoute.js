const session = require("express-session");
const userRouter = require("express").Router();

const upload = require("../middlewares/fileUpload");

const dev = require("../config");

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  userProfile, deleteUser, updateUser, forgetPassword, resetPassword,
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


userRouter.post("/register", upload.single('avatar'), registerUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/login", isLoggedOut, loginUser);
userRouter.get("/logout", isLoggedIn, logoutUser);
userRouter
    .route('/')
    .get(isLoggedIn, userProfile)
    .delete(isLoggedIn, deleteUser)
    .put( isLoggedIn, upload.single('avatar'), updateUser);
userRouter.post("/forget-password", isLoggedOut, forgetPassword);
userRouter.post("/reset-password", isLoggedOut, resetPassword);
userRouter.get("*", (req, res) => {
    res.status(404).json({
        message: "404 not found",
    });
});
// forget password -> email, new password, -> verification email -> reset password controller -> update the password if token is verified
// forget password -> email -> sendEmail -> reset link -> new password -> update the password

// admin - login, logout, admin crud, user crud, forget password, reset password

module.exports = userRouter;