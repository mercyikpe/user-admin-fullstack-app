const nodemailer = require("nodemailer");

const dev = require("../config");

exports.sendEmailWithNodeMailer = async (emailData) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: dev.app.smtpUsername, // generated ethereal user
        pass: dev.app.smtpPassword, // generated ethereal password
      },
    });

    const mailOptions = {
      from: dev.app.smtpUsername, // sender address
      to: emailData.email, // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html, // html body
    };

    // send mail with defined transport object
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("----- SMTP Error 1 -----");
        console.log(error);
      } else {
        console.log("Verification mail sent: %s", info.messageId);
      }
    });
  } catch (error) {
    console.log("----- SMTP Error 2 -----");
    console.log("Problem sending Email", error);
  }
};
