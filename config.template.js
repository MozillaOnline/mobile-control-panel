/*
 * Server configuration.
 */

exports.mail = {
  username: 'imap-username',
  password: 'imap-password',
  host: 'imap-host', // For example imap.163.com for mail.163.com.
  port: 993,  // imap default port.
};

// Mongodb
exports.db = {
  // mongoose connection string.
  url: 'mongodb://localhost/node-mobile-control-panel'
};
