/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var SettingsModel = require('./settings_model.js').SettingsModel;
var MailModel = require('./mail_model.js').MailModel;

/**
 * Connect to mongodb.
 */
exports.connect = function(url){
  mongoose.connect(url);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    console.log('mongodb connected.');
  });
};

/*
 * Get the setting value by key.
 */
exports.get = function(key, callback) {
  SettingsModel.get(key, callback);
};

/*
 * Set the setting value by key.
 */
exports.set = function(key, value, callback) {
  SettingsModel.set(key, value, callback);
};

exports.Mail = MailModel;
