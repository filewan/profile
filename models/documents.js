const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Document', new Schema({
  type: { type: String, index: true, },
  path: String,
  time: Schema.Types.Mixed,
}, { collection: 'Document' }));