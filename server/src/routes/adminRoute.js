const session = require("express-session");
const adminRouter = require("express").Router();

const dev = require("../config");

const { isLoggedIn, isLoggedOut } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");

const {
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  deleteUserByAdmin,
  updateUserByAdmin,
  exportUsers,
} = require("../controllers/admin");

// create session
adminRouter.use(
  session({
    name: "admin_session",
    secret: dev.app.sessionSecretKey || "ubongmike",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
  })
);

adminRouter.post("/login", isLoggedOut, loginAdmin);
adminRouter.get("/logout", isLoggedIn, logoutAdmin);
adminRouter.get("/dashboard", isLoggedIn, getAllUsers);
adminRouter.put("/dashboard/:id", isLoggedIn, isAdmin, updateUserByAdmin);
adminRouter.delete("/dashboard/:id", isLoggedIn, isAdmin, deleteUserByAdmin);

adminRouter.get("/dashboard/export-user-data", exportUsers);

// admin - login, logout, admin crud, user crud, forget password, reset password

module.exports = adminRouter;
