// utils/mailer.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or use your preferred SMTP service
  auth: {
    user: "Upbookins@gmail.com",
    pass: "nnay mqqz aqhu elmg", // use App Password, not your real password
  },
});

exports.sendBookingEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: '"UpBookin" <Upbookins@gmail.com>',
    to,
    subject,
    html,
  });
};
