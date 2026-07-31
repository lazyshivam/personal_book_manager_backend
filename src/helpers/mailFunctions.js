const nodemailer = require('nodemailer');
const config = require('../config/config');

const transport = nodemailer.createTransport(config.email.smtp);

const sendEmail = async (to, subject, htmlBody) => {
  const mailOptions = {
    from: config.email.from, // Replace with your sender information
    to: to,
    subject,
    html: htmlBody,
  };
  try {
    const info = await transport.sendMail(mailOptions);
    // console.log(`Email sent: ${info.messageId}`, info);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
};

function sendVerificationEmail(company, token) {
  const name = company.companyName ? company.companyName : company.name;
  const verificationLink = `${config.SITE_URL}/verify?token=${token}`;

  const emailTemplate = `
    <p>Hi ${name},</p>
    <p>Thank you for signing up. Please verify your email address by clicking the following link:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>If you did not create an account, please ignore this email or reply to let us know.</p>
    <p>This link is valid for 30 minutes.</p>
    <p>Kind Regards</p>
  `;

  sendEmail(company.email, 'Verify Your Account: Please Verify Your Account', emailTemplate);
}

function sendTicketReplyEmail(userEmail, name, ticketDetails) {
    const subject = `Ticket Reply: ${ticketDetails.subject}`;
  const htmlBody = `
    <p>Hi ${name},</p>
    <p>We are writing to inform you about a reply to your ticket (ID: ${ticketDetails._id}) regarding ${ticketDetails.subject}.</p>
    <p><b>Latest Reply:</b></p>
    <p>${ticketDetails.userAdminReplies[ticketDetails.userAdminReplies.length - 1].content}</p>
    <p>You can view the full conversation and manage your ticket through our platform: [link to ticket page]</p>
    <p>Thank you for using our support system.</p>
    <p>Sincerely,</p>
    <p>Your Store Name</p>
  `;
  
  sendEmail(userEmail, subject, htmlBody);
}

function sendTicketConfirmationEmail(userEmail, name, ticketDetails) {
  const subject = `Ticket Confirmation: Your Ticket (ID: ${ticketDetails._id})`;
  const htmlBody = `
    <p>Hi ${name},</p>
    <p>This email confirms that your ticket (ID: ${ticketDetails._id}) has been successfully submitted.</p>
    <p><b>Subject:</b> ${ticketDetails.subject}</p>
    <p><b>Message:</b> ${ticketDetails.message}</p>
    <p>Our support team will review your ticket and respond as soon as possible. You can view the status of your ticket and any replies through our platform: [link to ticket page]</p>
    <p>Thank you for contacting us.</p>
    <p>Sincerely,</p>
    <p>Your Store Name</p>
  `;
  
    sendEmail(userEmail, subject, htmlBody);
}
function sendResetPasswordEmail(userEmail, token) {
    const url =  `${config.SITE_URL}/reset-password?token=${token}`;
    const subject = 'Reset Your Password: Secure Your Account with a New Password';
    const htmlBody = `
      <p>Hi,</p>
      <p>You have requested to reset your password.</p>
      <p>To reset your password, click the following link and follow the instructions:</p>
      <a href="${url}" target="_blank">${url}</a>
      <p>If you did not request a password reset, please ignore this email or reply to let us know.</p>
      <p>This password reset is only valid for 30 minutes.</p>
      <p>Kind Regards</p>
    `;
  
    sendEmail(userEmail, subject, htmlBody);
  }

module.exports = {
  sendVerificationEmail,
  sendTicketConfirmationEmail,
    sendTicketReplyEmail,
    sendResetPasswordEmail
};
