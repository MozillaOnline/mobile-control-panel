/**
 * Module dependencies.
 */

var config = require('../config.js').mail;
var MailListener = require('mail-listener2');
var MailParser = require("mailparser").MailParser;
var htmlEncode = require('htmlencode').htmlEncode;
var db = require('../db');
var server = require('../socket_server');

/*
 * Begin monitoring the incoming mails.
 */
exports.start = function(message, data) {
  mailListener.start();
}

/*
 * Stop monitoring the incoming mails.
 */
exports.stop = function(message, data) {
  mailListener.stop();
}

var mailListener = new MailListener({
  username: config.username,
  password: config.password,
  host: config.host,
  port: config.port, // imap port
  secure: true, // use secure connection
  mailbox: 'INBOX', // mailbox to monitor
  // all fetched email willbe marked as seen and not fetched next time
  markSeen: true,
  // use it only if you want to get all unread email on lib start. Default is
  // `false`
  fetchUnreadOnStart: true
});

mailListener.on('server:connected', function() {
  console.log('imapConnected');
  fetchUnsaved();
});

mailListener.on('mail', function(mail) {
  console.log('New mail received: ', mail.subject);
  handleMail(mail);
});

mailListener.on("error", function(err) {
  console.error(err);
});

// The pending mails to handle.
var mailQueue = [];

function handleMail(mail) {
  // Filter unqualified mails by subject.
  // The subject should not be empty or contains string "re:".
  if (!mail.subject || /re:/i.test(mail.subject)) {
    return;
  }
  mailQueue.push(mail);
  if (mailQueue.length == 1) {
    processNextMail();
  }
}

function processNextMail() {
  if (mailQueue.length == 0) {
    server.broadcast('mail');
    return;
  }
  var mail = mailQueue[0];
  // For the plain text mail, mail.html is null and mail.text isn't null;
  // For the HTML mail, mail.html is not null and mail.text may be null.
  var body = mail.html ? mail.html : '<pre>' + htmlEncode(mail.text) + '</pre>';
  var dbMail = new db.Mail({
    _id: mail.messageId,
    subject: mail.subject,
    from: mail.from[0].address,
    body: body,
    date: new Date(mail.headers.date)
  });
  dbMail.addOrUpdate(function(item) {
    if (!item) {
      console.error('Failed to save mail.');
      mailQueue.shift();
      processNextMail();
      return;
    }
    db.set('lastSavedMailDate', item.date, function(value) {
      console.log('Mail saved: ', item.subject, 'from' , item.from);
      mailQueue.shift();
      processNextMail();
    });
  });
}
/*
 * Convert Date object to the Imap date string, such as 04-Nov-2013.
 * http://tools.ietf.org/html/rfc3501
 * date            = date-text / DQUOTE date-text DQUOTE
 *
 * date-day        = 1*2DIGIT
 *                     ; Day of month
 *
 * date-day-fixed  = (SP DIGIT) / 2DIGIT
 *                     ; Fixed-format version of date-day
 *
 * date-month      = "Jan" / "Feb" / "Mar" / "Apr" / "May" / "Jun" /
 *                   "Jul" / "Aug" / "Sep" / "Oct" / "Nov" / "Dec"
 *
 * date-text       = date-day "-" date-month "-" date-year
 */
function toImapDateString(date) {
  // "Sat Nov 23 2013"
  var str = date.toDateString();
  // "23-Nov-2013"
  return str.substr(8, 2) + '-' +
         str.substr(4, 3) + '-' +
         str.substr(-4);
}

function fetchUnsaved() {
  var sinceDate = db.get('lastSavedMailDate', function(sinceDate) {
    sinceDate = sinceDate || new Date(2013, 10, 1);
    var since = toImapDateString(sinceDate);

    // Fetch unsaved read mails.
    mailListener.imap.search([ 'SEEN', ['SINCE', since] ], function(err, results) {
      if (err) {
        fetchUnsavedError(err);
        return;
      }
      if(results.length > 0) {
        var f = mailListener.imap.fetch(results, { bodies: '' });
        f.on('message', function(msg, seqno) {
          var parser = new MailParser();
          parser.on("end", function(mail) {
            handleMail(mail);
          });
          msg.on('body', function(stream, info) {
            stream.pipe(parser);
          });
        });
        f.once('error', function(err) {
          fetchUnsavedError(err);
        });
        f.once('end', function() {
          console.log('Done fetching all unsaved mails!');
        });
      }
    }); // mailListener.imap.search
  }); // db.get
}

function fetchUnsavedError(err) {
  console.error('fetchUnsavedError: ' + err);
}
