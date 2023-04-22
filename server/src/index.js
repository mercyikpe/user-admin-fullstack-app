const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectDatabase = require('./config/db')

const dev = require("./config");
const userRouter = require("./routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRouter);

const PORT = dev.app.serverPort;

// test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running just fine",
  });
});

app.listen(PORT, async () => {
  console.log(`server is running on port http://localhost:${PORT}`);
    await connectDatabase();
    }
);
