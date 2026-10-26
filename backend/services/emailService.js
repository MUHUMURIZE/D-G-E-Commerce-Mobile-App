const nodemailer = require('nodemailer');
const env = require('../config/env');

async function sendPasswordResetEmail({ email, fullName, token }) {
  if (!env.smtp) {
    return { sent: false, reason: 'SMTP not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.password,
    },
  });

  const resetUrl = `${env.passwordResetUrl}?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: env.smtp.from,
    to: email,
    subject: 'D&G password reset',
    text: `Hello ${fullName},\n\nUse the following link to reset your password:\n${resetUrl}`,
    html: `<p>Hello ${fullName},</p><p>Use the following link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return { sent: true };
}

module.exports = { sendPasswordResetEmail };
