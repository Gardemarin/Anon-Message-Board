var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var table;
var messageSchema = new Schema({
  // thread: {
  //   type: Schema.Types.ObjectId,
  //   ref: table
  // },

  text: {
    type: String,
    trim: true,
    required: [true,
              ' Text field is empty']
  },
  delete_password: {
    type: String,
    trim: true,
    required: [true,
              ' Delete password field is empty']
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  bumped_on: {
    type: Date,
    default: Date.now
  },
  reported: {
    type: Boolean,
    default: false
  },
  replies: []
  // replies: [{
  //   type: Schema.Types.ObjectId,
  //   ref: table
  // }]
}, { emitIndexErrors: true });

var issueErrorsHandler = function(error, res, next) {
  let errorai = [];
  for (let err in error.errors){
    if (error.errors[err].name === 'ValidatorError')
      errorai.push(error.errors[err].message);
  }
  if (error.name === 'CastError'){
      errorai.push(new Error(' Wrong Id').message);
    }
  if (errorai.length > 0){
    next(new Error(errorai));
  } else {
    next();
  }
};

messageSchema.post('save', issueErrorsHandler);
messageSchema.post('update', issueErrorsHandler);
messageSchema.post('findOneAndUpdate', issueErrorsHandler);
messageSchema.post('findOneAndRemove', issueErrorsHandler);
messageSchema.post('findOne', issueErrorsHandler);
messageSchema.post('insertMany', issueErrorsHandler);
messageSchema.post('delete', issueErrorsHandler);

module.exports = function (db, _table){
  table = _table + '1';
  return db.model(table, messageSchema);
};

