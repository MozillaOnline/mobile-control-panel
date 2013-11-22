/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settingsSchema = new Schema({
  key: { type: String, index: { unique: true }, required: true },
  value: Schema.Types.Mixed
});

/*
 * Get the setting value by key.
 */
settingsSchema.statics.get = function(key, callback) {
  this.findOne( { key: key }, 'value', function(err, item) {
    if (err) {
      callback(null);
      return;
    }
    callback(item ? item.value : null);
  });
};

/*
 * Set the setting value by key.
 */
settingsSchema.statics.set = function(key, value, callback) {
  this.findOneAndUpdate({ key: key }, { $set: { value: value }}, { upsert: true },
                        function(err, item) {
    if (err) {
      callback(null);
      return;
    }
    callback(item.value);
  });
};

exports.SettingsModel = mongoose.model('Settings', settingsSchema);
