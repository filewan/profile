const mongoose = require('mongoose');

const { Schema } = mongoose;
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Profile', new Schema({
  pan: { type: String, index: true, unique:true },
  name: String,
  address: String,
  phone: Number,
  email: String,
  documents: [{
    type: { type: String, index: true, },
    path: String,
    time: Schema.Types.Mixed,
  }],

}, { collection: 'Profile' }));
