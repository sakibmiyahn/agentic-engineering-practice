async function receiveTaskUpdate(data) {
  console.log('[WEBHOOK] Received:', data);
  return { received: true };
}

module.exports = { receiveTaskUpdate };
