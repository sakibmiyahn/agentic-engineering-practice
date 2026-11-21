// TODO: replace with real email provider (SendGrid, SES, etc.)

/**
 * @description Logs delivery metadata and resolves a simulated email-delivery acknowledgement (sendEmail).
 * @param {Object} options - Email message options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.body - Email body accepted but unused by the simulated sender.
 * @returns {Promise<{sent: boolean, to: string, subject: string}>} Simulated delivery acknowledgement.
 */
function sendEmail({ to, subject, body }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

/**
 * @description Composes a personalized welcome message and returns the sender acknowledgement (sendWelcomeEmail).
 * @param {{name: string, email: string}} user - User receiving the welcome message.
 * @param {string} user.name - Name interpolated into the message.
 * @param {string} user.email - Recipient email address.
 * @returns {Promise<{sent: boolean, to: string, subject: string}>} Simulated welcome-email delivery acknowledgement.
 */
function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!',
    body: `Hi ${user.name}, your account is ready. Start managing your tasks at taskr.io.`
  });
}

module.exports = { sendEmail, sendWelcomeEmail };
