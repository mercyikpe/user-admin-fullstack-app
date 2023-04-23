require("dotenv").config();

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 8081,
    jwtSecretKey: process.env.JWT_SECRET_KEY || 'qwerty123456',
    smtpUsername: process.env.SMTP_USERNAME,
    smtpPassword: process.env.SMTP_PASSWORD,
    clientUrl: process.env.CLIENT_URL,
    sessionSecretKey: process.env.SESSION_SECRET_KEY
  },
  db: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017'
  },
};

module.exports = dev;
