const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const dev = require("./config");
const connectDatabase = require("./config/db");
const userRouter = require("./routes/usersRoute");
const adminRouter = require("./routes/adminRoute");
const { successResponse } = require("./helpers/responseHandlers");

const app = express();

const PORT = dev.app.serverPort;

app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

// test route
app.get("/", (req, res) => {
  successResponse(res, 200, "Server is running just fine");
});

app.listen(PORT, async () => {
  console.log(`server is running on port http://localhost:${PORT}`);
  await connectDatabase();
});
