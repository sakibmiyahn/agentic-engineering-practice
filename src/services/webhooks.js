/**
 * @description Logs the received webhook payload and acknowledges receipt (receiveTaskUpdate).
 * @param {*} data - Webhook payload to log.
 * @returns {Promise<{received: boolean}>} Acknowledgement that the webhook payload was received.
 */
async function receiveTaskUpdate(data) {
  console.log('[WEBHOOK] Received:', data);
  return { received: true };
}

module.exports = { receiveTaskUpdate };
