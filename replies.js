var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var table;
var repliesSchema = new Schema({
 text: {
    type: String,
    trim: true,
    required: [true,
              'Text field is empty']
  },
  delete_password: {
    type: String,
    trim: true,
    required: [true,
              'Delete password field is empty']
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  reported: {
    type: Boolean,
    default: false
  }
}, { emitIndexErrors: true });

var replyErrorsHandler = function(error, res, next) {
  let errorai = [];
  for (let err in error.errors){
    if (error.errors[err].name === 'ValidatorError')
      errorai.push(error.errors[err].message);
  }
  if (errorai.length > 0){
    next(new Error(errorai));
  } else {
    next();
  }
};

repliesSchema.post('save', replyErrorsHandler);
repliesSchema.post('update', replyErrorsHandler);
repliesSchema.post('findOneAndUpdate', replyErrorsHandler);
repliesSchema.post('insertMany', replyErrorsHandler);

module.exports = function (db, _table){
  table = _table + '1';
  return db.model(table, repliesSchema);
};

