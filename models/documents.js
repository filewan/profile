const mongoose = require('mongoose');


const { Schema } = mongoose;
mongoose.Promise = global.Promise;

module.exports = mongoose.model('Document', new Schema({
  type: { type: String, index: true, },
  path: String,
  issuedate: { type:
    {
      day: { type: Number, index: true, default: null},
      month: { type: Number, index: true, },
      year: { type: Number, index: true}
    }, default: null
  },
  expirydate: { type:
    {
      day: { type: Number, index: true, default: null},
      month: { type: Number, index: true, },
      year: { type: Number, index: true}
    }, default: null
  }
}, { collection: 'Document' }));