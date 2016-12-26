module.exports = require('monk')(process.env.MONGODB_URI || 'localhost/clientsettings');
