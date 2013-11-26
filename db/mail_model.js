/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mailSchema = new Schema({
  _id: { type: String }, // Message Id
  subject: { type: String, default: '' },
  from: { type: String, default: '' },
  body: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});


/*
 * Save a new mail or update the existing one.
 */
mailSchema.methods.addOrUpdate = function(callback) {
  this.model('Mail').findOneAndUpdate({
    _id: this._id
  }, {
    $set: {
      subject: this.subject,
      from: this.from,
      body: this.body,
      date: this.date
    }
  }, {
    upsert: true
  }, function(err, item) {
    if (err) {
      console.error(err);
      callback(null);
      return;
    }
    callback(item);
  });
};

/*
 * Get the total email number. If error occurs, return 0 as the total number.
 */
mailSchema.statics.getTotalNum = function(callback) {
  this.count({}, function(err, count) {
    if (err) {
      console.error(err);
      count = 0;
    }
    callback(count);
  });
};

/*
 * Get the specified range of the mails.
 * @param {number} offset The start position to get the mails.
 * @param {number} count The number of mails to get from the start position.
 * @return callback({Array.Mail} mails) The lean mails array will be
 * pass to the callback function.
 */
mailSchema.statics.getMails = function(offset, count, callback) {
  this.find({}, null, { skip: offset, limit: count, lean: true },
    function(err, mails) {
    if (err) {
      console.error(err);
      mails = [];
    }
    callback(mails);
  });
};

/*
 * Get the mail subjests of the last three months.
 * @return callback({Array.{ id: {String}, subject: {String} }, date: {Date}} mails)
 * The mails array will be pass to the callback function. The element of the
 * array contains the mail ID, the subject and the date.
 */
mailSchema.statics.getLastThreeMonthSubjects = function(callback) {
  var threeMonthAgo = new Date();
  threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
  this.find({
    date: {
      $gte: threeMonthAgo
    }
  }, '_id subject date', {
    lean: true
  }, function(err, mails) {
    if (err) {
      console.error(err);
      mails = [];
    }
    callback(mails);
  });
};

exports.MailModel = mongoose.model('Mail', mailSchema);
