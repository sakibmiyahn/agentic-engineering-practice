/**
 * @description Returns the API name, version, and health documentation path (getInfo).
 * @returns {Promise<{name: string, version: string, docs: string}>} API identity and documentation path.
 */
async function getInfo() {
  return { name: 'Taskr API', version: '1.0.0', docs: '/health' };
}

/**
 * @description Returns an OK status and the current ISO timestamp (getHealth).
 * @returns {Promise<{status: string, timestamp: string}>} Health status and timestamp at the time of the call.
 */
async function getHealth() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

module.exports = { getInfo, getHealth };
