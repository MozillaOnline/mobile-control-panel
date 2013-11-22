/**
 * Module dependencies.
 */

var Mail = require('../db').Mail;

/**
 * Get the total mail number.
 * @return { result: {Number} }.
 */
exports.getTotalNum = function(req, res){
  Mail.getTotalNum(function(num) {
    res.json({result: num});
  });
};

/**
 * Get mail subjects of the last three months.
 * @return {Array.Subject}. Subject is of the format:
 * {id: {String}, subject: {String}, date: {Date}}.
 */
exports.getLastThreeMonthSubjects = function(req, res){
  Mail.getLastThreeMonthSubjects(function(array) {
    res.json(array);
  });
};

/**
 * Show the mail content.
 */
exports.mail = function(req, res){
  var emptyMail = {
    subject: '',
    from: '',
    date: null
  };

  var messageId = req.query.messageId || '';
  if (!messageId) {
    res.render('mail', emptyMail);
  }
  Mail.findById(messageId, function(err, mail) {
    if (err) {
      console.error(err);
    }
    // Note: If the mail id doesn't exist, both the err and mail are null. So no
    // error doesn't mean we can get the mail data. We have to always check
    // and ensure mail is not null.
    mail = mail || emptyMail;
    res.render('mail', mail);
  });
};
