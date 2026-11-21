async function getInfo() {
  return { name: 'Taskr API', version: '1.0.0', docs: '/health' };
}

async function getHealth() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

module.exports = { getInfo, getHealth };
