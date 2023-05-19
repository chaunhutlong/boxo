const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @param {string} userName
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token, userName) => {
  const subject = 'Boxo - Đặt lại mật khẩu';
  // Replace process.env.FRONTEND_URL with the environment variable that contains the frontend URL
  const resetPasswordUrl = `${
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'http://localhost:3002'
  }/reset-password?token=${token}`;
  const text = `Chào ${userName},

  Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Boxo, một ứng dụng web chuyên về việc bán sách. Để tiếp tục quá trình đặt lại mật khẩu, vui lòng nhấp vào liên kết sau đây:

${resetPasswordUrl}

Nếu bạn không thực hiện yêu cầu đặt lại mật khẩu này, bạn có thể bỏ qua email này một cách an toàn. Xin lưu ý rằng việc bảo mật tài khoản của bạn là rất quan trọng đối với chúng tôi và chúng tôi khuyến nghị giữ kín thông tin đăng nhập của bạn.

Nếu bạn cần bất kỳ hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.

Trân trọng,
Đội ngũ Boxo`;

  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
