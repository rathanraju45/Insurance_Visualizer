const path = require('path');
// ensure server/.env is loaded by db.js already; require app
const createApp = require('./src/app');
const db = require('./DB/db');
const PORT = process.env.PORT || 3000;

async function start() {
	try {
		await db.initDB();
	} catch (err) {
		console.error('DB init failed, server will still start but DB calls will be lazy:', err.message || err);
	}

	const app = createApp();
	app.listen(PORT, () => {
		console.log(`Server listening on http://localhost:${PORT}`);
	});
}

start();
