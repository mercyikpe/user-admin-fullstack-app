const router = require("express").Router();
const formidable = require("express-formidable");
const { registerUser } = require("../controllers/users");

router.post("/register", formidable(), registerUser);

module.exports = router;
