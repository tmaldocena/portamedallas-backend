const { createClient } = require('@libsql/client');

const db = createClient({
	url: "libsql://portamedallas-ecommerce-tmaldocena.turso.io",
	authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTc1MzYwMjksImlkIjoiMmZjZDAzZjktOGEwMS00ZDNjLTk5OGItMjhmZjYyZTM4MGZjIn0.7352--PYecPT5K2OFm3Yernxuieu_OuSidMQDOrX3dVXjF716S8pR-nIlNk0tOLFlXE7dLl6zY1QgNSKsyDOBQ",
});

module.exports = db;